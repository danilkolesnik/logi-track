import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { isAdmin } from '@/lib/auth/roles';
import { NextResponse } from 'next/server';

const VALID_STATUSES = ['pending', 'in_transit', 'delivered', 'cancelled'];

function parseCsv(text: string): string[][] {
  const lines: string[] = [];
  let current = '';
  let inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (c === '"') {
      inQuotes = !inQuotes;
    } else if ((c === '\n' || c === '\r') && !inQuotes) {
      if (current.trim()) lines.push(current);
      current = '';
      if (c === '\r' && text[i + 1] === '\n') i++;
    } else {
      current += c;
    }
  }
  if (current.trim()) lines.push(current);
  return lines.map((line) => {
    const row: string[] = [];
    let cell = '';
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const c = line[i];
      if (c === '"') {
        inQuotes = !inQuotes;
      } else if ((c === ',' || c === ';') && !inQuotes) {
        row.push(cell.trim());
        cell = '';
      } else {
        cell += c;
      }
    }
    row.push(cell.trim());
    return row;
  });
}

function parseDate(s: string): string | null {
  const t = s?.trim();
  if (!t) return null;
  const m = t.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (m) return `${m[1]}-${m[2]}-${m[3]}`;
  const d = new Date(t);
  if (!Number.isNaN(d.getTime())) return d.toISOString().slice(0, 10);
  return null;
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

    const formData = await request.formData();
    const client_id = formData.get('client_id') as string | null;
    const file = formData.get('file') as File | null;

    if (!client_id?.trim()) {
      return NextResponse.json(
        { error: 'client_id is required' },
        { status: 400 }
      );
    }

    if (!file || !file.size) {
      return NextResponse.json(
        { error: 'CSV file is required' },
        { status: 400 }
      );
    }

    const raw = await file.text();
    const rows = parseCsv(raw);
    if (rows.length < 2) {
      return NextResponse.json(
        { error: 'CSV must have a header row and at least one data row' },
        { status: 400 }
      );
    }

    const header = rows[0].map((h) => h.toLowerCase().replace(/\s+/g, '_'));
    const trackingIdx = header.findIndex(
      (h) => h === 'tracking_number' || h === 'trackingnumber'
    );
    const originIdx = header.findIndex((h) => h === 'origin');
    const destinationIdx = header.findIndex((h) => h === 'destination');
    const statusIdx = header.findIndex((h) => h === 'status');
    const estIdx = header.findIndex(
      (h) => h === 'estimated_delivery' || h === 'estimateddelivery'
    );
    const actualIdx = header.findIndex(
      (h) => h === 'actual_delivery' || h === 'actualdelivery'
    );

    if (
      trackingIdx === -1 ||
      originIdx === -1 ||
      destinationIdx === -1
    ) {
      return NextResponse.json(
        {
          error:
            'CSV must include columns: tracking_number, origin, destination (status, estimated_delivery, actual_delivery are optional)',
        },
        { status: 400 }
      );
    }

    const toInsert: Array<{
      client_id: string;
      tracking_number: string;
      origin: string;
      destination: string;
      status: string;
      estimated_delivery: string | null;
      actual_delivery: string | null;
    }> = [];

    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];
      const tracking_number = (row[trackingIdx] ?? '').trim();
      const origin = (row[originIdx] ?? '').trim();
      const destination = (row[destinationIdx] ?? '').trim();
      if (!tracking_number || !origin || !destination) continue;

      let status = (statusIdx >= 0 ? row[statusIdx] : '')?.trim() || 'pending';
      if (!VALID_STATUSES.includes(status)) status = 'pending';

      const estimated_delivery =
        parseDate(estIdx >= 0 ? row[estIdx] : '') ?? null;
      const actual_delivery = parseDate(actualIdx >= 0 ? row[actualIdx] : '') ?? null;

      toInsert.push({
        client_id: client_id.trim(),
        tracking_number,
        origin,
        destination,
        status,
        estimated_delivery,
        actual_delivery,
      });
    }

    if (toInsert.length === 0) {
      return NextResponse.json(
        { error: 'No valid rows to import (need tracking_number, origin, destination)' },
        { status: 400 }
      );
    }

    const { data, error } = await admin
      .from('shipments')
      .insert(toInsert as unknown as never[])
      .select('id');

    if (error) {
      console.error('Error importing shipments:', error);
      return NextResponse.json(
        { error: error.message || 'Failed to import shipments' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      data: { imported: data?.length ?? toInsert.length, rows: data },
    });
  } catch (err) {
    console.error('Unexpected error:', err);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
