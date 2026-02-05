import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { isAdmin } from '@/lib/auth/roles';
import { createTmsClient } from '@/lib/tms/client';
import { mapTmsShipmentToShipment, mapTmsTimelineToTimeline, normalizeTmsStatus } from '@/lib/tms/mapper';
import { NextResponse } from 'next/server';

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

    if (!isAdmin(user)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const tmsClient = createTmsClient();
    if (!tmsClient) {
      return NextResponse.json(
        { error: 'TMS API not configured. Set TMS_API_URL and TMS_API_KEY in .env.local' },
        { status: 503 }
      );
    }

    const body = await request.json().catch(() => ({}));
    const { clientId, updatedSince } = body;

    const admin = createAdminClient();
    if (!admin) {
      return NextResponse.json(
        { error: 'Admin client not configured' },
        { status: 503 }
      );
    }

    const tmsShipments = await tmsClient.getShipments({
      clientId,
      updatedSince,
    });

    if (tmsShipments.length === 0) {
      return NextResponse.json({
        data: { synced: 0, created: 0, updated: 0 },
      });
    }

    const { data: usersData } = await admin.auth.admin.listUsers();
    const users = usersData?.users ?? [];
    const emailToUserId = new Map(
      users.map((u) => [u.email?.toLowerCase(), u.id])
    );

    let created = 0;
    let updated = 0;

    for (const tmsShipment of tmsShipments) {
      const clientEmail = tmsShipment.clientEmail?.toLowerCase();
      const clientIdForShipment = tmsShipment.clientId
        ? tmsShipment.clientId
        : clientEmail
          ? emailToUserId.get(clientEmail)
          : null;

      if (!clientIdForShipment) {
        console.warn(`Skipping shipment ${tmsShipment.trackingNumber}: client not found`);
        continue;
      }

      const shipmentData = mapTmsShipmentToShipment(tmsShipment, clientIdForShipment);

      const { data: existing } = await admin
        .from('shipments')
        .select('id')
        .eq('tracking_number', shipmentData.tracking_number)
        .single();

      if (existing && 'id' in existing) {
        const existingId = (existing as { id: string }).id;
        await admin
          .from('shipments')
          .update(shipmentData as never)
          .eq('id', existingId);

        const tmsTimeline = await tmsClient.getTimelineEvents(tmsShipment.trackingNumber);
        if (tmsTimeline.length > 0) {
          const timelineData = tmsTimeline.map((event) =>
            mapTmsTimelineToTimeline(event, existingId)
          );

          for (const event of timelineData) {
            const { data: existingEvent } = await admin
              .from('shipment_timeline')
              .select('id')
              .eq('shipment_id', event.shipment_id)
              .eq('status', event.status)
              .eq('timestamp', event.timestamp)
              .single();

            if (!existingEvent) {
              await admin.from('shipment_timeline').insert(event as never);
            }
          }
        }

        updated++;
      } else {
        const { data: newShipment } = await admin
          .from('shipments')
          .insert(shipmentData as never)
          .select('id')
          .single();

        if (newShipment && 'id' in newShipment) {
          const newShipmentId = (newShipment as { id: string }).id;
          const tmsTimeline = await tmsClient.getTimelineEvents(tmsShipment.trackingNumber);
          if (tmsTimeline.length > 0) {
            const timelineData = tmsTimeline.map((event) =>
              mapTmsTimelineToTimeline(event, newShipmentId)
            );
            await admin.from('shipment_timeline').insert(timelineData as never);
          }
          created++;
        }
      }
    }

    return NextResponse.json({
      data: {
        synced: tmsShipments.length,
        created,
        updated,
      },
    });
  } catch (error) {
    console.error('TMS sync error:', error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : 'Failed to sync with TMS',
      },
      { status: 500 }
    );
  }
}
