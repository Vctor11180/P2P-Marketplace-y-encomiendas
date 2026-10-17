// Cliente de la API off-chain (Neon). Si la BD no está configurada,
// todo sigue funcionando solo con datos on-chain.

export interface OrderMeta {
  title: string;
  origin_city: string | null;
  dest_city: string | null;
  seller: string;
  created_at: string;
}

export interface OrderEvidence {
  carrier: string;
  guide_number: string;
  photo_data_url: string | null;
  evidence_hash: string;
  created_at: string;
}

export interface OrderEvent {
  kind: string;
  tx_hash: string | null;
  actor: string | null;
  note: string | null;
  photo_data_url?: string | null;
  created_at: string;
}

export interface OffchainOrder {
  configured: boolean;
  meta: OrderMeta | null;
  evidence: OrderEvidence | null;
  events: OrderEvent[];
}

export interface DisputeItem {
  order_id: string;
  actor: string | null;
  note: string | null;
  photo_data_url?: string | null;
  created_at: string;
  title: string | null;
}

const EMPTY: OffchainOrder = { configured: false, meta: null, evidence: null, events: [] };

export async function fetchOffchainOrder(orderId: number): Promise<OffchainOrder> {
  try {
    const res = await fetch(`/api/orders/${orderId}`, { cache: "no-store" });
    if (!res.ok) return EMPTY;
    return await res.json();
  } catch {
    return EMPTY;
  }
}

// Nunca bloquea el flujo: si la BD falla, la tx on-chain ya quedó hecha.
async function post(orderId: number, body: Record<string, unknown>) {
  try {
    await fetch(`/api/orders/${orderId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
  } catch (err) {
    console.warn("No se pudo guardar en la BD off-chain:", err);
  }
}

export function saveOrderMeta(
  orderId: number,
  meta: { title: string; originCity: string; destCity: string; seller: string }
) {
  return post(orderId, { type: "meta", ...meta });
}

export function saveEvidence(
  orderId: number,
  ev: { carrier: string; guideNumber: string; photoDataUrl: string | null; evidenceHash: string }
) {
  return post(orderId, { type: "evidence", ...ev });
}

export function saveEvent(
  orderId: number,
  ev: { kind: string; txHash?: string; actor?: string; note?: string; photoDataUrl?: string }
) {
  return post(orderId, { type: "event", ...ev });
}

export async function fetchOpenDisputes(): Promise<{ configured: boolean; disputes: DisputeItem[] }> {
  try {
    const res = await fetch("/api/disputes", { cache: "no-store" });
    if (!res.ok) return { configured: false, disputes: [] };
    return await res.json();
  } catch {
    return { configured: false, disputes: [] };
  }
}

// Reduce la foto a ~1000px JPEG para guardarla como data URL en la BD.
export async function compressImage(file: File, maxSide = 1000, quality = 0.75): Promise<string> {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, maxSide / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  canvas.getContext("2d")!.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  return canvas.toDataURL("image/jpeg", quality);
}

// Mensaje canónico que se hashea y va on-chain. Cualquiera puede recalcularlo
// con los datos guardados y comprobar que la evidencia no fue alterada.
export function evidencePayload(carrier: string, guideNumber: string, photoDataUrl: string | null) {
  return `CHASKI-EVIDENCIA|${carrier.trim()}|${guideNumber.trim()}|${photoDataUrl ?? ""}`;
}
