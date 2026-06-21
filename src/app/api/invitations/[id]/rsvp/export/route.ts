import { NextRequest, NextResponse } from 'next/server';
import ExcelJS from 'exceljs';
import { createServerSupabaseClient, createServiceRoleSupabaseClient } from '@/lib/supabase/server';

const attendanceLabels: Record<string, string> = {
  yes: 'Sí asistirá', no: 'No asistirá', maybe: 'Tal vez',
};

function formatDate(iso: string): string {
  try {
    return new Intl.DateTimeFormat('es-MX', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
      .format(new Date(iso));
  } catch { return iso; }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  // 1. Auth check
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user?.email) {
    return NextResponse.json({ error: 'No autorizado.' }, { status: 401 });
  }

  const email = user.email;
  const svc   = createServiceRoleSupabaseClient();

  // 2. Ownership check
  const { data: inv } = await svc
    .from('invitations')
    .select('id, title, customer_email')
    .eq('id', id)
    .eq('customer_email', email)
    .single();

  if (!inv) {
    return NextResponse.json({ error: 'Invitación no encontrada.' }, { status: 404 });
  }

  // 3. Fetch RSVP responses
  const { data: rows, error } = await svc
    .from('rsvp_responses')
    .select('id, name, phone, attendance, guest_count, message, created_at')
    .eq('invitation_id', id)
    .order('created_at', { ascending: true });

  if (error) {
    return NextResponse.json({ error: 'Error al obtener respuestas.' }, { status: 500 });
  }

  // 4. Build Excel
  const wb = new ExcelJS.Workbook();
  wb.creator  = 'Kompralo';
  wb.created  = new Date();

  const ws = wb.addWorksheet('Confirmaciones RSVP');

  ws.columns = [
    { header: 'Nombre',               key: 'name',        width: 28 },
    { header: 'Asistencia',            key: 'attendance',  width: 18 },
    { header: 'Acompañantes',          key: 'companions',  width: 16 },
    { header: 'Total de personas',     key: 'total',       width: 18 },
    { header: 'Teléfono',              key: 'phone',       width: 18 },
    { header: 'Mensaje',               key: 'message',     width: 36 },
    { header: 'Fecha de confirmación', key: 'date',        width: 26 },
  ];

  // Header row style
  const headerRow = ws.getRow(1);
  headerRow.font  = { bold: true, size: 11 };
  headerRow.fill  = {
    type: 'pattern', pattern: 'solid',
    fgColor: { argb: 'FFF1E3C8' },
  };
  headerRow.alignment = { vertical: 'middle' };
  headerRow.height    = 22;

  // Data rows
  for (const r of rows ?? []) {
    const attending  = r.attendance === 'yes';
    const companions = Math.max(0, Number(r.guest_count ?? 0));
    const total      = attending ? companions + 1 : 0;

    const row = ws.addRow({
      name:       r.name,
      attendance: attendanceLabels[r.attendance] ?? r.attendance,
      companions: attending ? companions : '—',
      total:      attending ? total : '—',
      phone:      r.phone ?? '—',
      message:    r.message ?? '',
      date:       formatDate(r.created_at),
    });

    // Colour attendance cell
    const attCell = row.getCell('attendance');
    if (r.attendance === 'yes') {
      attCell.font = { color: { argb: 'FF238636' }, bold: true };
    } else if (r.attendance === 'no') {
      attCell.font = { color: { argb: 'FFD32F2F' }, bold: true };
    } else {
      attCell.font = { color: { argb: 'FF8A6D3B' } };
    }

    row.alignment = { wrapText: true, vertical: 'top' };
  }

  // Freeze header
  ws.views = [{ state: 'frozen', ySplit: 1 }];

  // Summary row below data
  if ((rows?.length ?? 0) > 0) {
    ws.addRow({});
    const yesCount    = (rows ?? []).filter(r => r.attendance === 'yes').length;
    const totalPeople = (rows ?? []).reduce((sum, r) => {
      if (r.attendance !== 'yes') return sum;
      return sum + Math.max(0, Number(r.guest_count ?? 0)) + 1;
    }, 0);

    const summaryRow = ws.addRow({
      name:       `Total: ${rows?.length ?? 0} respuestas`,
      attendance: `${yesCount} sí / ${(rows?.length ?? 0) - yesCount} no`,
      total:      totalPeople,
    });
    summaryRow.font = { bold: true, italic: true, color: { argb: 'FF6B4A35' } };
  }

  // 5. Serialize and return
  const buffer = await wb.xlsx.writeBuffer();

  const slugName = (inv.title ?? 'invitacion')
    .toLowerCase()
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .slice(0, 40);

  return new NextResponse(buffer, {
    status: 200,
    headers: {
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename="confirmaciones-${slugName}.xlsx"`,
      'Cache-Control': 'no-store',
    },
  });
}
