import { neon } from "@neondatabase/serverless";

// Datos off-chain de cada orden (título, ciudades, foto, historial de tx).
// On-chain solo vive el dinero, el estado y el hash de evidencia.

export const isDbConfigured = () => !!process.env.DATABASE_URL;

let schemaReady: Promise<void> | null = null;

export function getSql() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL no configurada");
  }
  const sql = neon(process.env.DATABASE_URL);
  if (!schemaReady) {
    schemaReady = (async () => {
      await sql`CREATE TABLE IF NOT EXISTS order_meta (
        contract_id TEXT NOT NULL,
        order_id BIGINT NOT NULL,
        title TEXT NOT NULL,
        origin_city TEXT,
        dest_city TEXT,
        seller TEXT NOT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
        PRIMARY KEY (contract_id, order_id)
      )`;
      await sql`CREATE TABLE IF NOT EXISTS order_evidence (
        contract_id TEXT NOT NULL,
        order_id BIGINT NOT NULL,
        carrier TEXT NOT NULL,
        guide_number TEXT NOT NULL,
        photo_data_url TEXT,
        evidence_hash TEXT NOT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
        PRIMARY KEY (contract_id, order_id)
      )`;
      await sql`CREATE TABLE IF NOT EXISTS order_events (
        id SERIAL PRIMARY KEY,
        contract_id TEXT NOT NULL,
        order_id BIGINT NOT NULL,
        kind TEXT NOT NULL,
        tx_hash TEXT,
        actor TEXT,
        note TEXT,
        photo_data_url TEXT,
        created_at TIMESTAMPTZ NOT NULL DEFAULT now()
      )`;
      await sql`ALTER TABLE order_events ADD COLUMN IF NOT EXISTS photo_data_url TEXT`;
    })().catch((err) => {
      schemaReady = null;
      throw err;
    });
  }
  return { sql, ready: schemaReady };
}

export function contractId() {
  return (
    process.env.NEXT_PUBLIC_ESCROW_CONTRACT_ID ||
    "CDXK2V4UCM7WQW74JVOIYLPZBYGQTWYWXNWF4PPJUDLJNTQ526JPML3X"
  );
}
