import { getSql, isDbConfigured, contractId } from "@/lib/db";

// Órdenes con disputa abierta y aún sin veredicto registrado
export async function GET() {
  if (!isDbConfigured()) {
    return Response.json({ configured: false, disputes: [] });
  }
  const { sql, ready } = getSql();
  await ready;
  const cid = contractId();
  const disputes = await sql`
    SELECT e.order_id, e.actor, e.note, e.created_at, m.title
    FROM order_events e
    LEFT JOIN order_meta m ON m.contract_id = e.contract_id AND m.order_id = e.order_id
    WHERE e.contract_id = ${cid} AND e.kind = 'disputed'
      AND NOT EXISTS (
        SELECT 1 FROM order_events r
        WHERE r.contract_id = e.contract_id AND r.order_id = e.order_id AND r.kind = 'resolved'
      )
    ORDER BY e.created_at DESC`;
  return Response.json({ configured: true, disputes });
}
