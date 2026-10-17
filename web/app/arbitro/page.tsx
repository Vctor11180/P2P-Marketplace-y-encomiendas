"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useWallet } from "@/context/WalletContext";
import { getOrder, resolveDispute, OrderData } from "@/lib/stellar";
import {
  Scale,
  Search,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Loader2,
  ArrowLeft,
  ShieldAlert,
} from "lucide-react";

export default function ArbitroPage() {
  const { address } = useWallet();
  const [searchId, setSearchId] = useState("1");
  const [order, setOrder] = useState<OrderData | null>(null);
  const [loading, setLoading] = useState(false);
  const [resolving, setResolving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchId) return;

    try {
      setLoading(true);
      setMessage(null);
      const data = await getOrder(parseInt(searchId, 10));
      setOrder(data);
    } catch (err: any) {
      alert(`Error buscando orden: ${err.message || err}`);
      setOrder(null);
    } finally {
      setLoading(false);
    }
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

    if (!confirm(`¿Estás seguro de que deseas emitir el veredicto para ${actionText}?`)) {
      return;
    }

    try {
      setResolving(true);
      setMessage(null);
      await resolveDispute({
        orderId: order.id,
        arbiterAddress: address,
        releaseToSeller,
      });

      setMessage(
        `Disputa resuelta exitosamente a favor del ${
          releaseToSeller ? "Vendedor (fondos liberados)" : "Comprador (fondos reembolsados)"
        }.`
      );

      // Refresh order
      const updated = await getOrder(order.id);
      setOrder(updated);
    } catch (err: any) {
      alert(`Error resolviendo disputa: ${err.message || err}`);
    } finally {
      setResolving(false);
    }
  };

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
          Resolvé disputas entre compradores y vendedores basándote en la evidencia de
          la guía de transporte y fotos registradas on-chain.
        </p>
      </div>

      {/* Search Input */}
      <form
        onSubmit={handleSearch}
        className="flex items-center gap-3 p-2 rounded-2xl bg-slate-900 border border-slate-800 mb-8"
      >
        <Search className="w-5 h-5 text-slate-500 ml-3 shrink-0" />
        <input
          type="number"
          placeholder="Ingresá el número de Orden (ej. 1)"
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

      {/* Resolution Result Banner */}
      {message && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-sm mb-6 flex items-center gap-2">
          <CheckCircle className="w-5 h-5 shrink-0" />
          <span>{message}</span>
        </div>
      )}

      {/* Order Details Card */}
      {order && (
        <div className="p-6 sm:p-8 rounded-3xl bg-slate-900 border border-slate-800 space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-800">
            <div>
              <p className="text-xs text-slate-400 font-mono">ORDEN #{order.id}</p>
              <h3 className="text-xl font-bold text-white mt-0.5">
                {order.amount} XLM
              </h3>
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
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
              <span className="text-slate-500 block mb-0.5">Vendedor:</span>
              <span className="font-mono text-slate-200 break-all">{order.seller}</span>
            </div>

            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
              <span className="text-slate-500 block mb-0.5">Comprador:</span>
              <span className="font-mono text-slate-200 break-all">
                {order.buyer || "Sin asignar"}
              </span>
            </div>

            {order.evidenceHash && (
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-slate-500 block mb-0.5">
                  Hash de Evidencia On-Chain:
                </span>
                <span className="font-mono text-purple-400 break-all">
                  {order.evidenceHash}
                </span>
              </div>
            )}
          </div>

          {/* Dispute Resolution Actions */}
          {order.status === "Disputed" ? (
            <div className="pt-4 border-t border-slate-800 space-y-4">
              <div className="flex items-center gap-2 text-rose-400 text-xs font-medium">
                <ShieldAlert className="w-4 h-4 shrink-0" />
                <span>Esta orden requiere veredicto de árbitro.</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  onClick={() => handleResolve(true)}
                  disabled={resolving}
                  className="py-3 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <CheckCircle className="w-4 h-4" />
                  Liberar al Vendedor
                </button>

                <button
                  onClick={() => handleResolve(false)}
                  disabled={resolving}
                  className="py-3 px-4 rounded-xl bg-rose-500 hover:bg-rose-400 text-white font-bold text-xs transition flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <XCircle className="w-4 h-4" />
                  Reembolsar al Comprador
                </button>
              </div>
            </div>
          ) : (
            <p className="text-xs text-slate-500 text-center italic pt-2">
              Esta orden no se encuentra en estado de disputa.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
