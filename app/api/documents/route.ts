import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const shipmentId = searchParams.get('shipment_id');

    let query = supabase
      .from('documents')
      .select('*, shipments!inner(client_id)')
      .eq('shipments.client_id', user.id)
      .order('uploaded_at', { ascending: false });

    if (shipmentId) {
      query = query.eq('shipment_id', shipmentId);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching documents:', error);
      return NextResponse.json(
        { error: 'Failed to fetch documents' },
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
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const shipmentId = formData.get('shipment_id') as string;

    if (!file || !shipmentId) {
      return NextResponse.json(
        { error: 'File and shipment_id are required' },
        { status: 400 }
      );
    }

    const { data: shipment } = await supabase
      .from('shipments')
      .select('client_id')
      .eq('id', shipmentId)
      .single();

    if (!shipment || shipment.client_id !== user.id) {
      return NextResponse.json({ error: 'Shipment not found' }, { status: 404 });
    }

    const fileExt = file.name.split('.').pop();
    const fileName = `${shipmentId}/${Date.now()}.${fileExt}`;
    const filePath = `shipments/${fileName}`;

    const adminClient = createAdminClient();
    if (!adminClient) {
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      );
    }

    const { error: uploadError } = await adminClient.storage
      .from('documents')
      .upload(filePath, file);

    if (uploadError) {
      console.error('Error uploading file:', uploadError);
      return NextResponse.json(
        { error: 'Failed to upload file' },
        { status: 500 }
      );
    }

    const {
      data: { publicUrl },
    } = adminClient.storage.from('documents').getPublicUrl(filePath);

    const { data, error } = await supabase
      .from('documents')
      .insert([
        {
          shipment_id: shipmentId,
          file_name: file.name,
          file_url: publicUrl,
          file_type: file.type,
          file_size: file.size,
        },
      ])
      .select()
      .single();

    if (error) {
      console.error('Error creating document record:', error);
      return NextResponse.json(
        { error: 'Failed to create document record' },
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
