"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useWallet } from "@/context/WalletContext";
import {
  getOrder,
  resolveDispute,
  sha256Hex,
  explorerTxUrl,
  OrderData,
} from "@/lib/stellar";
import {
  fetchOffchainOrder,
  fetchOpenDisputes,
  saveEvent,
  evidencePayload,
  OffchainOrder,
  DisputeItem,
} from "@/lib/offchain";
import {
  Scale,
  Search,
  CheckCircle,
  XCircle,
  Loader2,
  ArrowLeft,
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  ExternalLink,
} from "lucide-react";

const ARBITER_ADDRESS = process.env.NEXT_PUBLIC_ARBITER_ADDRESS || "";

export default function ArbitroPage() {
  const { address, connect, isConnecting } = useWallet();
  const [searchId, setSearchId] = useState("");
  const [order, setOrder] = useState<OrderData | null>(null);
  const [offchain, setOffchain] = useState<OffchainOrder | null>(null);
  const [evidenceVerified, setEvidenceVerified] = useState<boolean | null>(null);
  const [disputes, setDisputes] = useState<DisputeItem[]>([]);
  const [dbConfigured, setDbConfigured] = useState(true);
  const [loading, setLoading] = useState(false);
  const [resolving, setResolving] = useState(false);
  const [message, setMessage] = useState<{ text: string; hash: string } | null>(null);

  const loadDisputes = async () => {
    const res = await fetchOpenDisputes();
    setDbConfigured(res.configured);
    setDisputes(res.disputes);
  };

  const loadOrder = async (id: number) => {
    try {
      setLoading(true);
      setMessage(null);
      const [data, off] = await Promise.all([getOrder(id), fetchOffchainOrder(id)]);
      setOrder(data);
      setOffchain(off);
      setSearchId(String(id));
      const ev = off.evidence;
      if (ev && data.evidenceHash) {
        const h = await sha256Hex(evidencePayload(ev.carrier, ev.guide_number, ev.photo_data_url));
        setEvidenceVerified(h === data.evidenceHash);
      } else {
        setEvidenceVerified(null);
      }
    } catch (err: any) {
      alert(`Error buscando orden: ${err.message || err}`);
      setOrder(null);
      setOffchain(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDisputes();
    const fromQuery = Number(new URLSearchParams(window.location.search).get("orden"));
    if (Number.isInteger(fromQuery) && fromQuery > 0) loadOrder(fromQuery);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const id = parseInt(searchId, 10);
    if (id > 0) loadOrder(id);
  };

  const handleResolve = async (releaseToSeller: boolean) => {
    if (!address) {
      alert("Conectá tu billetera Freighter de árbitro primero.");
      return;
    }
    if (!order) return;

    const actionText = releaseToSeller
      ? "liberar los fondos al VENDEDOR"
      : "reembolsar los fondos al COMPRADOR";
    if (!confirm(`¿Confirmás el veredicto: ${actionText}?`)) return;

    try {
      setResolving(true);
      setMessage(null);
      const res = await resolveDispute({ orderId: order.id, arbiterAddress: address, releaseToSeller });
      await saveEvent(order.id, {
        kind: "resolved",
        txHash: res.hash,
        actor: address,
        note: releaseToSeller ? "A favor del vendedor" : "A favor del comprador (reembolso)",
      });
      setMessage({
        text: `Disputa resuelta a favor del ${
          releaseToSeller ? "Vendedor (fondos liberados)" : "Comprador (fondos reembolsados)"
        }.`,
        hash: res.hash,
      });
      await loadOrder(order.id);
      await loadDisputes();
    } catch (err: any) {
      alert(`Error resolviendo disputa: ${err.message || err}`);
    } finally {
      setResolving(false);
    }
  };

  const disputeEvent = offchain?.events.filter((e) => e.kind === "disputed").at(-1);
  const evidence = offchain?.evidence;
  const wrongWallet = !!address && !!ARBITER_ADDRESS && address !== ARBITER_ADDRESS;

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <div className="mb-6">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-white transition"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Volver al Inicio
        </Link>
      </div>

      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20 text-xs font-semibold mb-3">
          <Scale className="w-3.5 h-3.5" />
          <span>Módulo de Resolución 2 de 3</span>
        </div>
        <h1 className="text-3xl font-extrabold text-white">Panel de Arbitraje</h1>
        <p className="text-sm text-slate-400 mt-2">
          Resolvé disputas con la evidencia de la guía y la foto del paquete, verificadas contra el hash on-chain.
        </p>
      </div>

      {/* Estado de la wallet */}
      {!address ? (
        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs mb-6 flex items-center justify-between gap-3">
          <span>Conectá la wallet del árbitro en Freighter para emitir veredictos.</span>
          <button
            onClick={connect}
            disabled={isConnecting}
            className="px-3 py-1.5 rounded-lg bg-amber-500 text-slate-950 font-bold shrink-0"
          >
            Conectar
          </button>
        </div>
      ) : wrongWallet ? (
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs mb-6">
          La wallet conectada no es la del árbitro del contrato. Cambiá de cuenta en Freighter a{" "}
          <span className="font-mono">{ARBITER_ADDRESS.slice(0, 6)}…{ARBITER_ADDRESS.slice(-6)}</span>.
        </div>
      ) : null}

      {/* Disputas abiertas */}
      <div className="mb-8">
        <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider mb-3">
          Disputas abiertas
        </p>
        {!dbConfigured ? (
          <p className="text-xs text-slate-500 italic">
            Base de datos no configurada: buscá la orden por número.
          </p>
        ) : disputes.length === 0 ? (
          <p className="text-xs text-slate-500 italic">No hay disputas pendientes.</p>
        ) : (
          <div className="space-y-2">
            {disputes.map((d) => (
              <button
                key={d.order_id}
                onClick={() => loadOrder(Number(d.order_id))}
                className="w-full text-left p-3 rounded-xl bg-slate-900 border border-rose-500/20 hover:border-rose-500/50 transition text-xs"
              >
                <span className="font-mono font-bold text-rose-400">#{d.order_id}</span>{" "}
                <span className="text-slate-200">{d.title ?? "Sin título"}</span>
                {d.note && <p className="text-slate-400 mt-1 truncate">“{d.note}”</p>}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Búsqueda */}
      <form
        onSubmit={handleSearch}
        className="flex items-center gap-3 p-2 rounded-2xl bg-slate-900 border border-slate-800 mb-8"
      >
        <Search className="w-5 h-5 text-slate-500 ml-3 shrink-0" />
        <input
          type="number"
          placeholder="Número de orden (ej. 1)"
          value={searchId}
          onChange={(e) => setSearchId(e.target.value)}
          className="w-full bg-transparent text-sm text-white focus:outline-none placeholder-slate-500"
        />
        <button
          type="submit"
          disabled={loading}
          className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition shrink-0"
        >
          {loading ? "Buscando..." : "Buscar Orden"}
        </button>
      </form>

      {message && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-sm mb-6 space-y-1">
          <p className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 shrink-0" />
            {message.text}
          </p>
          <a
            href={explorerTxUrl(message.hash)}
            target="_blank"
            rel="noreferrer"
            className="font-mono text-xs hover:underline inline-flex items-center gap-1"
          >
            Ver tx {message.hash.slice(0, 8)}… <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      )}

      {order && (
        <div className="p-6 sm:p-8 rounded-3xl bg-slate-900 border border-slate-800 space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-800">
            <div>
              <p className="text-xs text-slate-400 font-mono">ORDEN #{order.id}</p>
              {offchain?.meta?.title && (
                <p className="text-sm text-slate-200 font-semibold">{offchain.meta.title}</p>
              )}
              <h3 className="text-xl font-bold text-white mt-0.5">{order.amount} XLM</h3>
            </div>
            <span
              className={`px-3 py-1 rounded-xl text-xs font-bold border ${
                order.status === "Disputed"
                  ? "bg-rose-500/10 text-rose-400 border-rose-500/30"
                  : "bg-slate-800 text-slate-300 border-slate-700"
              }`}
            >
              Estado: {order.status}
            </span>
          </div>

          <div className="space-y-3 text-xs">
            {disputeEvent && (
              <div className="p-3 rounded-xl bg-rose-500/5 border border-rose-500/20">
                <span className="text-rose-400 font-semibold block mb-0.5">
                  Motivo ({disputeEvent.actor === order.seller ? "vendedor" : "comprador"}):
                </span>
                <span className="text-slate-200">{disputeEvent.note || "Sin motivo registrado"}</span>
              </div>
            )}

            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
              <span className="text-slate-500 block mb-0.5">Vendedor:</span>
              <span className="font-mono text-slate-200 break-all">{order.seller}</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
              <span className="text-slate-500 block mb-0.5">Comprador:</span>
              <span className="font-mono text-slate-200 break-all">{order.buyer || "Sin asignar"}</span>
            </div>

            {order.evidenceHash && (
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <span className="text-slate-500 block">Evidencia de envío:</span>
                {evidence?.photo_data_url && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={evidence.photo_data_url}
                    alt="Foto del paquete"
                    className="w-full max-h-64 object-contain rounded-lg border border-slate-800"
                  />
                )}
                {evidence && (
                  <p className="text-slate-300">
                    {evidence.carrier} · guía <span className="font-mono">{evidence.guide_number}</span>
                  </p>
                )}
                {evidenceVerified === true && (
                  <p className="text-emerald-400 font-semibold flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" /> Evidencia íntegra: coincide con el hash on-chain
                  </p>
                )}
                {evidenceVerified === false && (
                  <p className="text-rose-400 font-semibold flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5" /> La evidencia fue alterada: no coincide con el hash on-chain
                  </p>
                )}
                <span className="font-mono text-purple-400 break-all block">{order.evidenceHash}</span>
              </div>
            )}
          </div>

          {order.status === "Disputed" ? (
            <div className="pt-4 border-t border-slate-800 space-y-4">
              <div className="flex items-center gap-2 text-rose-400 text-xs font-medium">
                <ShieldAlert className="w-4 h-4 shrink-0" />
                <span>Esta orden requiere veredicto de árbitro.</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  onClick={() => handleResolve(true)}
                  disabled={resolving || wrongWallet}
                  className="py-3 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {resolving ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                  Liberar al Vendedor
                </button>
                <button
                  onClick={() => handleResolve(false)}
                  disabled={resolving || wrongWallet}
                  className="py-3 px-4 rounded-xl bg-rose-500 hover:bg-rose-400 text-white font-bold text-xs transition flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {resolving ? <Loader2 className="w-4 h-4 animate-spin" /> : <XCircle className="w-4 h-4" />}
                  Reembolsar al Comprador
                </button>
              </div>
            </div>
          ) : (
            <p className="text-xs text-slate-500 text-center italic pt-2">
              Esta orden no se encuentra en estado de disputa.{" "}
              <Link href={`/orden/${order.id}`} className="text-emerald-400 underline">
                Ver orden
              </Link>
            </p>
          )}
        </div>
      )}
    </div>
  );
}
