import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { isAdmin } from '@/lib/auth/roles';
import { VALID_ROLE_VALUES } from '@/lib/auth/roles-options';
import { NextResponse } from 'next/server';

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id: userId } = await context.params;
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    if (!isAdmin(user)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const admin = createAdminClient();
    if (!admin) {
      return NextResponse.json(
        { error: 'Admin client not configured' },
        { status: 503 }
      );
    }

    const body = await request.json();
    const { role } = body;

    if (role !== undefined) {
      if (!VALID_ROLE_VALUES.includes(role)) {
        return NextResponse.json(
          { error: `role must be one of: ${VALID_ROLE_VALUES.join(', ')}` },
          { status: 400 }
        );
      }

      const { data: targetUser } = await admin.auth.admin.getUserById(userId);
      if (!targetUser?.user) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
      }

      const existingMeta = (targetUser.user.app_metadata ?? {}) as Record<string, unknown>;
      const { error: updateError } = await admin.auth.admin.updateUserById(
        userId,
        { app_metadata: { ...existingMeta, role } }
      );

      if (updateError) {
        console.error('Error updating user:', updateError);
        return NextResponse.json(
          { error: updateError.message || 'Failed to update user' },
          { status: 500 }
        );
      }
    }

    const { data: updated } = await admin.auth.admin.getUserById(userId);
    const u = updated?.user;
    return NextResponse.json({
      data: u
        ? {
            id: u.id,
            email: u.email ?? '',
            role: (u.app_metadata?.role as string) ?? 'user',
            created_at: u.created_at,
            last_sign_in_at: u.last_sign_in_at,
          }
        : null,
    });
  } catch (err) {
    console.error('Unexpected error:', err);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
