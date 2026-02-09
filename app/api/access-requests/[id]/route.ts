import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { isAdmin } from '@/lib/auth/roles';
import { sendAccessGrantedEmail } from '@/lib/email';
import { NextResponse } from 'next/server';

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const supabase = await createClient();
    const {
      data: { user: currentUser },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !currentUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    if (!isAdmin(currentUser)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const status = body?.status as string | undefined;

    if (!status || !['pending', 'approved', 'rejected'].includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status. Must be pending, approved, or rejected' },
        { status: 400 }
      );
    }

    if (status === 'approved') {
      const { data: accessRequest, error: fetchError } = await supabase
        .from('access_requests')
        .select('id, email, status')
        .eq('id', id)
        .single();

      if (fetchError || !accessRequest) {
        return NextResponse.json(
          { error: 'Access request not found' },
          { status: 404 }
        );
      }

      if (accessRequest.status !== 'pending') {
        return NextResponse.json(
          { error: 'Only pending requests can be approved' },
          { status: 400 }
        );
      }

      const admin = createAdminClient();
      if (!admin) {
        return NextResponse.json(
          {
            error:
              'SUPABASE_SERVICE_ROLE_KEY is not set. Add it to .env.local.',
          },
          { status: 503 }
        );
      }

      const origin = new URL(request.url).origin;
      const redirectTo = `${origin}/dashboard`;

      const { data: createdUser, error: createError } =
        await admin.auth.admin.createUser({
          email: accessRequest.email,
          email_confirm: true,
        });

      if (createError) {
        console.error('Error creating user:', createError);
        return NextResponse.json(
          {
            error:
              createError.message ||
              'User may already exist. Create them manually in Supabase Auth.',
          },
          { status: 400 }
        );
      }

      if (!createdUser?.user?.id) {
        return NextResponse.json(
          { error: 'Failed to create user' },
          { status: 500 }
        );
      }

      const { error: updateMetaError } =
        await admin.auth.admin.updateUserById(createdUser.user.id, {
          app_metadata: { role: 'user' },
        });
      if (updateMetaError) {
        console.error('Error setting user role:', updateMetaError);
      }

      const { data: linkData, error: linkError } =
        await admin.auth.admin.generateLink({
          type: 'magiclink',
          email: accessRequest.email,
          options: { redirectTo },
        });

      if (linkError || !linkData?.properties?.action_link) {
        await admin.auth.admin.deleteUser(createdUser.user.id);
        return NextResponse.json(
          {
            error:
              linkError?.message ||
              'Failed to generate magic link.',
          },
          { status: 503 }
        );
      }

      const magicLink = linkData.properties.action_link;
      const { ok, error: emailError } = await sendAccessGrantedEmail(
        accessRequest.email,
        magicLink
      );

      if (!ok) {
        await admin.auth.admin.deleteUser(createdUser.user.id);
        return NextResponse.json(
          {
            error:
              emailError ||
              'Failed to send email. Configure SMTP (SMTP_HOST, SMTP_PORT, etc.) in .env.local.',
          },
          { status: 503 }
        );
      }
    }

    const { data, error } = await supabase
      .from('access_requests')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating access request:', error);
      return NextResponse.json(
        { error: 'Failed to update access request' },
        { status: 500 }
      );
    }

    return NextResponse.json({ data });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
