import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { NextResponse } from 'next/server';

const VALID_STATUSES = ['pending', 'in_transit', 'delivered', 'cancelled'];

export async function GET() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const admin = createAdminClient();
    if (!admin) {
      return NextResponse.json(
        { error: 'Admin client not configured' },
        { status: 503 }
      );
    }

    const { data, error } = await admin
      .from('shipments')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching shipments:', error);
      return NextResponse.json(
        { error: 'Failed to fetch shipments' },
        { status: 500 }
      );
    }

    return NextResponse.json({ data: data ?? [] });
  } catch (err) {
    console.error('Unexpected error:', err);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const admin = createAdminClient();
    if (!admin) {
      return NextResponse.json(
        { error: 'Admin client not configured' },
        { status: 503 }
      );
    }

    const body = await request.json();
    const {
      client_id,
      tracking_number,
      origin,
      destination,
      status = 'pending',
      estimated_delivery,
      actual_delivery,
    } = body;

    if (!client_id || !tracking_number || !origin || !destination) {
      return NextResponse.json(
        {
          error:
            'client_id, tracking_number, origin, and destination are required',
        },
        { status: 400 }
      );
    }

    if (!VALID_STATUSES.includes(status)) {
      return NextResponse.json(
        {
          error: `status must be one of: ${VALID_STATUSES.join(', ')}`,
        },
        { status: 400 }
      );
    }

    const { data, error } = await admin
      .from('shipments')
      .insert([
        {
          client_id,
          tracking_number: String(tracking_number).trim(),
          origin: String(origin).trim(),
          destination: String(destination).trim(),
          status,
          estimated_delivery: estimated_delivery || null,
          actual_delivery: actual_delivery || null,
        },
      ] as never)
      .select()
      .single();

    if (error) {
      console.error('Error creating shipment:', error);
      return NextResponse.json(
        { error: error.message || 'Failed to create shipment' },
        { status: 500 }
      );
    }

    return NextResponse.json({ data }, { status: 201 });
  } catch (err) {
    console.error('Unexpected error:', err);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
