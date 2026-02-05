import { createAdminClient } from '@/lib/supabase/admin';
import { mapTmsShipmentToShipment, mapTmsTimelineToTimeline } from '@/lib/tms/mapper';
import { normalizeTmsStatus } from '@/lib/tms/mapper';
import { NextResponse } from 'next/server';

const WEBHOOK_SECRET = process.env.TMS_WEBHOOK_SECRET;

function verifyWebhook(request: Request): boolean {
  if (!WEBHOOK_SECRET) {
    return true;
  }

  const signature = request.headers.get('x-tms-signature');
  return signature === WEBHOOK_SECRET;
}

export async function POST(request: Request) {
  try {
    if (!verifyWebhook(request)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { event, data } = body;

    if (!event || !data) {
      return NextResponse.json(
        { error: 'Invalid webhook payload' },
        { status: 400 }
      );
    }

    const admin = createAdminClient();
    if (!admin) {
      return NextResponse.json(
        { error: 'Admin client not configured' },
        { status: 503 }
      );
    }

    if (event === 'shipment.updated' || event === 'shipment.created') {
      const {
        trackingNumber,
        origin,
        destination,
        status,
        estimatedDelivery,
        actualDelivery,
        clientEmail,
        clientId,
      } = data;

      if (!trackingNumber || !origin || !destination) {
        return NextResponse.json(
          { error: 'Missing required fields' },
          { status: 400 }
        );
      }

      let clientIdForShipment = clientId;

      if (!clientIdForShipment && clientEmail) {
        const { data: usersData } = await admin.auth.admin.listUsers();
        const users = usersData?.users || [];
        const user = users.find(
          (u: any) => u.email?.toLowerCase() === clientEmail.toLowerCase()
        );
        if (user) {
          clientIdForShipment = user.id;
        }
      }

      if (!clientIdForShipment) {
        return NextResponse.json(
          { error: 'Client not found' },
          { status: 404 }
        );
      }

      const shipmentData = {
        client_id: clientIdForShipment,
        tracking_number: trackingNumber,
        origin,
        destination,
        status: normalizeTmsStatus(status || 'pending'),
        estimated_delivery: estimatedDelivery || null,
        actual_delivery: actualDelivery || null,
      };

      const { data: existing } = await admin
        .from('shipments')
        .select('id')
        .eq('tracking_number', trackingNumber)
        .single();

      if (existing) {
        const existingId = (existing as { id: string }).id;
        await admin.from('shipments').update(shipmentData as never).eq('id', existingId);
      } else {
        const { data: newShipment } = await admin
          .from('shipments')
          .insert(shipmentData as never)
          .select('id')
          .single();

        if (newShipment && data.timeline) {
          const newShipmentId = (newShipment as { id: string }).id;
          const timelineData = data.timeline.map((event: any) =>
            mapTmsTimelineToTimeline(event, newShipmentId)
          );
          await admin.from('shipment_timeline').insert(timelineData as never[]);
        }
      }

      return NextResponse.json({ success: true });
    }

    if (event === 'timeline.updated') {
      const { trackingNumber, events } = data;

      if (!trackingNumber || !events || !Array.isArray(events)) {
        return NextResponse.json(
          { error: 'Invalid timeline data' },
          { status: 400 }
        );
      }

      const { data: shipment } = await admin
        .from('shipments')
        .select('id')
        .eq('tracking_number', trackingNumber)
        .single();

      if (!shipment) {
        return NextResponse.json(
          { error: 'Shipment not found' },
          { status: 404 }
        );
      }

      const shipmentId = (shipment as { id: string }).id;

      for (const event of events) {
        const timelineData = mapTmsTimelineToTimeline(event, shipmentId);

        const { data: existing } = await admin
          .from('shipment_timeline')
          .select('id')
          .eq('shipment_id', timelineData.shipment_id)
          .eq('status', timelineData.status)
          .eq('timestamp', timelineData.timestamp)
          .single();

        if (!existing) {
          await admin.from('shipment_timeline').insert([timelineData] as never[]);
        }
      }

      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'Unknown event type' }, { status: 400 });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : 'Webhook processing failed',
      },
      { status: 500 }
    );
  }
}
