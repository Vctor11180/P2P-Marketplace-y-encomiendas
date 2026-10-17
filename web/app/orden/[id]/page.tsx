"use client";

import React, { useEffect, useState, use } from "react";
import Link from "next/link";
import { useWallet } from "@/context/WalletContext";
import {
  getOrder,
  getReputation,
  fundOrder,
  markShipped,
  confirmReceived,
  openDispute,
  sha256Hex,
  OrderData,
  ReputationData,
  CONTRACT_ID,
} from "@/lib/stellar";
import {
  ShieldCheck,
  Package,
  Truck,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ExternalLink,
  Loader2,
  Lock,
  Upload,
  User,
  ArrowLeft,
  RefreshCw,
} from "lucide-react";

export default function OrderPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const orderId = parseInt(resolvedParams.id, 10);

  const { address, isConnecting, connect } = useWallet();

  const [order, setOrder] = useState<OrderData | null>(null);
  const [reputation, setReputation] = useState<ReputationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Shipping form state
  const [guideNumber, setGuideNumber] = useState("");
  const [busCompany, setBusCompany] = useState("Trans Copacabana");
  const [photoSelected, setPhotoSelected] = useState(false);

  const fetchOrderData = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getOrder(orderId);
      setOrder(data);

      if (data.seller) {
        const rep = await getReputation(data.seller);
        setReputation(rep);
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || "No se pudo cargar la orden.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isNaN(orderId)) {
      fetchOrderData();
    }
  }, [orderId]);

  // Actions
  const handleFund = async () => {
    if (!address) {
      alert("Conectá tu billetera Freighter primero.");
      return;
    }
    try {
      setActionLoading(true);
      await fundOrder({ orderId, buyerAddress: address });
      await fetchOrderData();
    } catch (err: any) {
      alert(`Error al fondear: ${err.message || err}`);
    } finally {
      setActionLoading(false);
    }
  };

  const handleMarkShipped = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!address) {
      alert("Conectá tu billetera Freighter primero.");
      return;
    }
    try {
      setActionLoading(true);
      // Hash of bus company + guide number
      const evidenceString = `ENCOMIENDA:${busCompany}:${guideNumber}:${Date.now()}`;
      const hash = await sha256Hex(evidenceString);

      await markShipped({
        orderId,
        sellerAddress: address,
        evidenceHashHex: hash,
      });
      await fetchOrderData();
    } catch (err: any) {
      alert(`Error al marcar enviado: ${err.message || err}`);
    } finally {
      setActionLoading(false);
    }
  };

  const handleConfirm = async () => {
    if (!address) {
      alert("Conectá tu billetera Freighter primero.");
      return;
    }
    if (!confirm("¿Confirmas que recibiste el paquete conforme? Esto liberará los fondos al vendedor.")) {
      return;
    }
    try {
      setActionLoading(true);
      await confirmReceived({ orderId, buyerAddress: address });
      await fetchOrderData();
    } catch (err: any) {
      alert(`Error al confirmar: ${err.message || err}`);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDispute = async () => {
    if (!address) {
      alert("Conectá tu billetera Freighter primero.");
      return;
    }
    const motive = prompt("Describí el motivo de la disputa (ej. paquete dañado o no entregado):");
    if (!motive) return;

    try {
      setActionLoading(true);
      await openDispute({ orderId, callerAddress: address });
      await fetchOrderData();
    } catch (err: any) {
      alert(`Error al abrir disputa: ${err.message || err}`);
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center flex flex-col items-center">
        <Loader2 className="w-8 h-8 text-emerald-400 animate-spin mb-4" />
        <p className="text-slate-400 text-sm">Consultando contrato en Soroban Testnet...</p>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center">
        <div className="p-6 rounded-2xl bg-slate-900 border border-red-500/30 text-red-400 mb-6">
          <AlertTriangle className="w-8 h-8 mx-auto mb-2 text-red-400" />
          <h2 className="text-lg font-bold text-white mb-1">Orden #{orderId} no encontrada</h2>
          <p className="text-xs text-slate-400">{error || "Verificá el ID de la orden."}</p>
        </div>
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs font-semibold text-emerald-400 hover:text-emerald-300"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver al Inicio
        </Link>
      </div>
    );
  }

  // Steps progress indicator
  const steps = ["Created", "Funded", "Shipped", "Completed"];
  const currentStepIndex = steps.indexOf(order.status);

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      {/* Top Bar Navigation & Refresh */}
      <div className="flex items-center justify-between mb-6">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-white transition"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Inicio
        </Link>
        <button
          onClick={fetchOrderData}
          className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-emerald-400 transition"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Actualizar Estado
        </button>
      </div>

      {/* Main Order Card */}
      <div className="p-6 sm:p-8 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-8">
        {/* Header: Title & Status Badge */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-mono font-bold text-slate-400">
                ORDEN #{order.id}
              </span>
              <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                Encomienda P2P
              </span>
            </div>
            <h1 className="text-2xl font-extrabold text-white">
              {order.amount} XLM{" "}
              <span className="text-sm font-normal text-slate-400">en custodia</span>
            </h1>
          </div>

          {/* Status Badge */}
          <div className="shrink-0">
            {order.status === "Created" && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/30 text-xs font-bold">
                <Clock className="w-3.5 h-3.5" />
                Esperando Pago
              </span>
            )}
            {order.status === "Funded" && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/30 text-xs font-bold">
                <Lock className="w-3.5 h-3.5" />
                Dinero en Escrow · Por Despachar
              </span>
            )}
            {order.status === "Shipped" && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/30 text-xs font-bold">
                <Truck className="w-3.5 h-3.5" />
                En Tránsito por Encomienda
              </span>
            )}
            {order.status === "Completed" && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-xs font-bold">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Completada y Liberada
              </span>
            )}
            {order.status === "Disputed" && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/30 text-xs font-bold">
                <AlertTriangle className="w-3.5 h-3.5" />
                En Disputa · Árbitro Asignado
              </span>
            )}
            {order.status === "Refunded" && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 text-slate-300 border border-slate-700 text-xs font-bold">
                Reembolsada
              </span>
            )}
          </div>
        </div>

        {/* Progress Bar (Only for happy path states) */}
        {order.status !== "Disputed" && order.status !== "Refunded" && (
          <div className="w-full">
            <div className="grid grid-cols-4 gap-2 text-center text-xs font-medium mb-2">
              <span className={currentStepIndex >= 0 ? "text-emerald-400" : "text-slate-600"}>
                1. Creada
              </span>
              <span className={currentStepIndex >= 1 ? "text-emerald-400" : "text-slate-600"}>
                2. Bloqueada
              </span>
              <span className={currentStepIndex >= 2 ? "text-emerald-400" : "text-slate-600"}>
                3. Enviada
              </span>
              <span className={currentStepIndex >= 3 ? "text-emerald-400" : "text-slate-600"}>
                4. Entregada
              </span>
            </div>
            <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-500"
                style={{
                  width: `${((currentStepIndex + 1) / 4) * 100}%`,
                }}
              />
            </div>
          </div>
        )}

        {/* Parties and On-chain Details */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800">
            <p className="text-slate-500 font-semibold uppercase tracking-wider mb-1 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5" /> Vendedor
            </p>
            <p className="font-mono text-slate-200 truncate">{order.seller}</p>
            {reputation && (
              <p className="text-[11px] text-emerald-400 mt-2 font-medium">
                ★ Reputación: {reputation.completed} tratos exitosos ·{" "}
                {reputation.disputesLost} disputas
              </p>
            )}
          </div>

          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800">
            <p className="text-slate-500 font-semibold uppercase tracking-wider mb-1 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5" /> Comprador
            </p>
            <p className="font-mono text-slate-200 truncate">
              {order.buyer || "Aún no asignado (esperando depósito)"}
            </p>
          </div>
        </div>

        {/* Evidence Hash (If shipped) */}
        {order.evidenceHash && (
          <div className="p-4 rounded-2xl bg-slate-950 border border-purple-500/20 text-xs">
            <p className="text-purple-400 font-semibold uppercase tracking-wider mb-1">
              Hash de Guía y Paquete On-Chain:
            </p>
            <p className="font-mono text-slate-300 break-all">{order.evidenceHash}</p>
          </div>
        )}

        {/* ACTIONS SECTION */}
        <div className="pt-2">
          {/* 1. STATE: CREATED (Buyer Funds) */}
          {order.status === "Created" && (
            <div className="p-6 rounded-2xl bg-emerald-500/5 border border-emerald-500/20 text-center space-y-4">
              <div>
                <h3 className="font-bold text-white text-base">
                  Asegurar Pago con Escrow
                </h3>
                <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
                  Al pagar, los {order.amount} XLM quedan bloqueados en el contrato
                  Soroban. El vendedor solo cobrará cuando vos confirmes que llegó el paquete.
                </p>
              </div>

              {address ? (
                <button
                  onClick={handleFund}
                  disabled={actionLoading}
                  className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold text-sm transition shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 mx-auto disabled:opacity-50"
                >
                  {actionLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Lock className="w-4 h-4" />
                  )}
                  Pagar {order.amount} XLM y Asegurar Fondos
                </button>
              ) : (
                <button
                  onClick={connect}
                  disabled={isConnecting}
                  className="w-full sm:w-auto px-6 py-3 rounded-xl bg-emerald-500 text-slate-950 font-bold text-xs"
                >
                  Conectar Freighter para Pagar
                </button>
              )}
            </div>
          )}

          {/* 2. STATE: FUNDED (Seller Ships) */}
          {order.status === "Funded" && (
            <form
              onSubmit={handleMarkShipped}
              className="p-6 rounded-2xl bg-blue-500/5 border border-blue-500/20 space-y-4"
            >
              <div>
                <h3 className="font-bold text-white text-base">
                  Despachar Encomienda
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  El pago ya está bloqueado en el contrato. Lleva el paquete a la flota y
                  subí los datos de la guía para registrar la evidencia on-chain.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block text-slate-400 font-medium mb-1">
                    Empresa de Transporte / Flota
                  </label>
                  <input
                    type="text"
                    required
                    value={busCompany}
                    onChange={(e) => setBusCompany(e.target.value)}
                    placeholder="Ej. Flota Bolívar / Trans Copacabana"
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-medium mb-1">
                    Número de Guía / Factura
                  </label>
                  <input
                    type="text"
                    required
                    value={guideNumber}
                    onChange={(e) => setGuideNumber(e.target.value)}
                    placeholder="Ej. TC-98421"
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Photo upload mock */}
              <div className="p-4 rounded-xl border border-dashed border-slate-700 bg-slate-950/60 text-center">
                <input
                  type="file"
                  id="guide-photo"
                  className="hidden"
                  onChange={() => setPhotoSelected(true)}
                />
                <label
                  htmlFor="guide-photo"
                  className="cursor-pointer flex flex-col items-center justify-center text-xs text-slate-400 hover:text-white"
                >
                  <Upload className="w-5 h-5 text-blue-400 mb-1" />
                  <span>
                    {photoSelected
                      ? "✓ Foto del paquete y guía cargada"
                      : "Subir foto del paquete con el sticker de guía"}
                  </span>
                </label>
              </div>

              <button
                type="submit"
                disabled={actionLoading}
                className="w-full py-3.5 rounded-xl bg-blue-500 hover:bg-blue-400 text-slate-950 font-bold text-sm transition flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {actionLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Truck className="w-4 h-4" />
                )}
                Confirmar Envío y Registrar Evidencia On-Chain
              </button>
            </form>
          )}

          {/* 3. STATE: SHIPPED (Buyer Confirms or Disputes) */}
          {order.status === "Shipped" && (
            <div className="p-6 rounded-2xl bg-purple-500/5 border border-purple-500/20 text-center space-y-4">
              <div>
                <h3 className="font-bold text-white text-base">
                  Paquete en Camino
                </h3>
                <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
                  Cuando retires tu paquete en la terminal y verifiques que todo está
                  en orden, hacé clic en confirmar para liberar los fondos al vendedor.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <button
                  onClick={handleConfirm}
                  disabled={actionLoading}
                  className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm transition flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {actionLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <CheckCircle2 className="w-4 h-4" />
                  )}
                  Confirmar Recepción y Liberar Pago
                </button>

                <button
                  onClick={handleDispute}
                  disabled={actionLoading}
                  className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-slate-800 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 text-sm font-semibold transition flex items-center justify-center gap-2"
                >
                  <AlertTriangle className="w-4 h-4" />
                  Abrir Disputa
                </button>
              </div>
            </div>
          )}

          {/* 4. STATE: COMPLETED */}
          {order.status === "Completed" && (
            <div className="p-6 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-center space-y-2">
              <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
              <h3 className="text-lg font-bold text-white">¡Trato Completado con Éxito!</h3>
              <p className="text-xs text-slate-300 max-w-md mx-auto">
                El comprador confirmó la recepción. Los fondos fueron transferidos
                automáticamente a la billetera del vendedor y se registró reputación positiva on-chain.
              </p>
            </div>
          )}

          {/* 5. STATE: DISPUTED */}
          {order.status === "Disputed" && (
            <div className="p-6 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-center space-y-3">
              <AlertTriangle className="w-8 h-8 text-rose-400 mx-auto" />
              <h3 className="text-lg font-bold text-white">Orden en Revisión por Árbitro</h3>
              <p className="text-xs text-slate-300 max-w-md mx-auto">
                Se ha congelado la orden mientras el equipo de arbitraje revisa la evidencia
                de la guía y las fotos del paquete.
              </p>
              <Link
                href="/arbitro"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-rose-400 underline underline-offset-4"
              >
                Ir al Panel de Árbitros ↗
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
