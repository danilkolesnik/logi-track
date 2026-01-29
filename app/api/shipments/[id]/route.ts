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

    const { data, error } = await supabase
      .from('shipments')
      .select('*')
      .eq('id', params.id)
      .eq('client_id', user.id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Shipment not found' }, { status: 404 });
      }
      console.error('Error fetching shipment:', error);
      return NextResponse.json(
        { error: 'Failed to fetch shipment' },
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

export async function PATCH(
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

    const { data: shipment } = await supabase
      .from('shipments')
      .select('client_id')
      .eq('id', params.id)
      .single();

    if (!shipment || shipment.client_id !== user.id) {
      return NextResponse.json({ error: 'Shipment not found' }, { status: 404 });
    }

    const { data, error } = await supabase
      .from('shipments')
      .update({ ...body, updated_at: new Date().toISOString() })
      .eq('id', params.id)
      .select()
      .single();

    if (error) {
      console.error('Error updating shipment:', error);
      return NextResponse.json(
        { error: 'Failed to update shipment' },
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
