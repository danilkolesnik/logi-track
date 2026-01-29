import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { session },
    } = await supabase.auth.getSession();
    const user = session?.user;

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const trackingNumber = searchParams.get('tracking_number');

    let query = supabase
      .from('shipments')
      .select('*')
      .eq('client_id', user.id)
      .order('created_at', { ascending: false });

    if (status) {
      query = query.eq('status', status);
    }

    if (trackingNumber) {
      query = query.ilike('tracking_number', `%${trackingNumber}%`);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching shipments:', error);
      return NextResponse.json(
        { error: 'Failed to fetch shipments' },
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

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { session },
    } = await supabase.auth.getSession();
    const user = session?.user;

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      tracking_number,
      origin,
      destination,
      estimated_delivery,
      status = 'pending',
    } = body;

    if (!tracking_number || !origin || !destination) {
      return NextResponse.json(
        { error: 'Tracking number, origin, and destination are required' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('shipments')
      .insert([
        {
          client_id: user.id,
          tracking_number,
          origin,
          destination,
          estimated_delivery: estimated_delivery || null,
          status,
        },
      ])
      .select()
      .single();

    if (error) {
      console.error('Error creating shipment:', error);
      return NextResponse.json(
        { error: 'Failed to create shipment' },
        { status: 500 }
      );
    }

    return NextResponse.json({ data }, { status: 201 });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
