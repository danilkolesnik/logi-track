import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient();
    const {
      data: { session },
    } = await supabase.auth.getSession();
    const user = session?.user;

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: shipment } = await supabase
      .from('shipments')
      .select('client_id')
      .eq('id', params.id)
      .single();

    if (!shipment || shipment.client_id !== user.id) {
      return NextResponse.json({ error: 'Shipment not found' }, { status: 404 });
    }

    const { data, error } = await supabase
      .from('shipment_timeline')
      .select('*')
      .eq('shipment_id', params.id)
      .order('timestamp', { ascending: true });

    if (error) {
      console.error('Error fetching timeline:', error);
      return NextResponse.json(
        { error: 'Failed to fetch timeline' },
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

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
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
    const { status, notes, location } = body;

    if (!status) {
      return NextResponse.json(
        { error: 'Status is required' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('shipment_timeline')
      .insert([
        {
          shipment_id: params.id,
          status,
          notes: notes || null,
          location: location || null,
        },
      ])
      .select()
      .single();

    if (error) {
      console.error('Error creating timeline entry:', error);
      return NextResponse.json(
        { error: 'Failed to create timeline entry' },
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
