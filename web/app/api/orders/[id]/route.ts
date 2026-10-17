import { getSql, isDbConfigured, contractId } from "@/lib/db";

const EVENT_KINDS = ["created", "funded", "shipped", "completed", "timeout", "refunded", "disputed", "resolved"];

// GET: metadatos + evidencia + historial de transacciones de una orden
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const orderId = Number(id);
  if (!isDbConfigured()) {
    return Response.json({ configured: false, meta: null, evidence: null, events: [] });
  }
  if (!Number.isInteger(orderId) || orderId <= 0) {
    return Response.json({ error: "ID inválido" }, { status: 400 });
  }

  const { sql, ready } = getSql();
  await ready;
  const cid = contractId();
  const [meta] = await sql`SELECT title, origin_city, dest_city, seller, created_at
    FROM order_meta WHERE contract_id = ${cid} AND order_id = ${orderId}`;
  const [evidence] = await sql`SELECT carrier, guide_number, photo_data_url, evidence_hash, created_at
    FROM order_evidence WHERE contract_id = ${cid} AND order_id = ${orderId}`;
  const events = await sql`SELECT kind, tx_hash, actor, note, photo_data_url, created_at
    FROM order_events WHERE contract_id = ${cid} AND order_id = ${orderId}
    ORDER BY created_at ASC, id ASC`;

  return Response.json({ configured: true, meta: meta ?? null, evidence: evidence ?? null, events });
}

// POST: registra info off-chain después de que la tx on-chain se confirmó.
// body: { type: "meta" | "evidence" | "event", ... }
export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const orderId = Number(id);
  if (!isDbConfigured()) {
    return Response.json({ configured: false });
  }
  if (!Number.isInteger(orderId) || orderId <= 0) {
    return Response.json({ error: "ID inválido" }, { status: 400 });
  }

  const body = await req.json();
  const { sql, ready } = getSql();
  await ready;
  const cid = contractId();

  if (body.type === "meta") {
    if (!body.title || !body.seller) {
      return Response.json({ error: "Faltan title/seller" }, { status: 400 });
    }
    await sql`INSERT INTO order_meta (contract_id, order_id, title, origin_city, dest_city, seller)
      VALUES (${cid}, ${orderId}, ${String(body.title).slice(0, 200)}, ${body.originCity ?? null},
              ${body.destCity ?? null}, ${body.seller})
      ON CONFLICT (contract_id, order_id) DO NOTHING`;
  } else if (body.type === "evidence") {
    const photo: string | null = body.photoDataUrl ?? null;
    if (photo && (!photo.startsWith("data:image/") || photo.length > 1_500_000)) {
      return Response.json({ error: "Foto inválida o muy grande" }, { status: 400 });
    }
    await sql`INSERT INTO order_evidence (contract_id, order_id, carrier, guide_number, photo_data_url, evidence_hash)
      VALUES (${cid}, ${orderId}, ${String(body.carrier).slice(0, 100)}, ${String(body.guideNumber).slice(0, 100)},
              ${photo}, ${body.evidenceHash})
      ON CONFLICT (contract_id, order_id) DO UPDATE SET
        carrier = EXCLUDED.carrier, guide_number = EXCLUDED.guide_number,
        photo_data_url = EXCLUDED.photo_data_url, evidence_hash = EXCLUDED.evidence_hash`;
  } else if (body.type === "event") {
    if (!EVENT_KINDS.includes(body.kind)) {
      return Response.json({ error: "Evento inválido" }, { status: 400 });
    }
    const disputePhoto: string | null = body.photoDataUrl ?? null;
    if (disputePhoto && (!disputePhoto.startsWith("data:image/") || disputePhoto.length > 1_500_000)) {
      return Response.json({ error: "Foto de reclamo inválida o muy grande" }, { status: 400 });
    }
    await sql`INSERT INTO order_events (contract_id, order_id, kind, tx_hash, actor, note, photo_data_url)
      VALUES (${cid}, ${orderId}, ${body.kind}, ${body.txHash ?? null}, ${body.actor ?? null},
              ${body.note ? String(body.note).slice(0, 1000) : null}, ${disputePhoto})`;
  } else {
    return Response.json({ error: "Tipo inválido" }, { status: 400 });
  }

  return Response.json({ ok: true });
}
