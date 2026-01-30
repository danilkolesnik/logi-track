import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { sendEmail } from '@/lib/email';
import { generatePassword } from '@/lib/helpers';
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

      const password = generatePassword();
      const origin = new URL(request.url).origin;
      const loginUrl = `${origin}/login`;

      const { data: createdUser, error: createError } =
        await admin.auth.admin.createUser({
          email: accessRequest.email,
          password,
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

      if (createdUser?.user?.id) {
        const { error: updateMetaError } =
          await admin.auth.admin.updateUserById(createdUser.user.id, {
            app_metadata: { role: 'user' },
          });
        if (updateMetaError) {
          console.error('Error setting user role:', updateMetaError);
        }
      }

      const emailResult = await sendEmail(
        accessRequest.email,
        password,
        loginUrl
      );

      if (!emailResult.ok) {
        if (createdUser?.user?.id) {
          await admin.auth.admin.deleteUser(createdUser.user.id);
        }
        return NextResponse.json(
          {
            error:
              emailResult.error ||
              'User created but email failed. Set RESEND_API_KEY and RESEND_FROM_EMAIL in .env.local.',
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
