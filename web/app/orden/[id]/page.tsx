"use client";

import React, { useCallback, useEffect, useState, use } from "react";
import Link from "next/link";
import { useWallet } from "@/context/WalletContext";
import {
  getOrder,
  getReputation,
  fundOrder,
  markShipped,
  confirmReceived,
  openDispute,
  claimAfterTimeout,
  refundIfNotShipped,
  sha256Hex,
  explorerTxUrl,
  OrderData,
  ReputationData,
} from "@/lib/stellar";
import {
  fetchOffchainOrder,
  saveEvent,
  saveEvidence,
  compressImage,
  evidencePayload,
  OffchainOrder,
} from "@/lib/offchain";
import {
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
  MapPin,
  Copy,
  Check,
  Share2,
  ShieldCheck,
  History,
  Undo2,
} from "lucide-react";

const EVENT_LABELS: Record<string, string> = {
  created: "Orden creada",
  funded: "Pago bloqueado en escrow",
  shipped: "Encomienda despachada",
  completed: "Recepción confirmada · pago liberado",
  timeout: "Liberación automática por plazo vencido",
  refunded: "Reembolso al comprador",
  disputed: "Disputa abierta",
  resolved: "Disputa resuelta por árbitro",
};

function formatRemaining(secs: number) {
  if (secs <= 0) return "vencido";
  const h = Math.floor(secs / 3600);
  const m = Math.floor((secs % 3600) / 60);
  const s = Math.floor(secs % 60);
  if (h > 0) return `${h}h ${m.toString().padStart(2, "0")}m`;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

function shortAddr(a: string) {
  return `${a.slice(0, 5)}…${a.slice(-5)}`;
}

export default function OrderPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const orderId = parseInt(resolvedParams.id, 10);

  const { address, isConnecting, connect } = useWallet();

  const [order, setOrder] = useState<OrderData | null>(null);
  const [offchain, setOffchain] = useState<OffchainOrder | null>(null);
  const [reputation, setReputation] = useState<ReputationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastTx, setLastTx] = useState<{ label: string; hash: string } | null>(null);
  const [now, setNow] = useState(() => Math.floor(Date.now() / 1000));
  const [copied, setCopied] = useState(false);
  const [evidenceVerified, setEvidenceVerified] = useState<boolean | null>(null);

  // Formulario de envío
  const [guideNumber, setGuideNumber] = useState("");
  const [busCompany, setBusCompany] = useState("Trans Copacabana");
  const [photoDataUrl, setPhotoDataUrl] = useState<string | null>(null);

  // Formulario de disputa
  const [showDisputeForm, setShowDisputeForm] = useState(false);
  const [disputeMotive, setDisputeMotive] = useState("");
  const [disputePhotoDataUrl, setDisputePhotoDataUrl] = useState<string | null>(null);
  const [uploadingDisputePhoto, setUploadingDisputePhoto] = useState(false);

  const fetchOrderData = useCallback(
    async (silent = false) => {
      try {
        if (!silent) setLoading(true);
        setError(null);
        const [data, off] = await Promise.all([
          getOrder(orderId),
          fetchOffchainOrder(orderId),
        ]);
        setOrder(data);
        setOffchain(off);
        setReputation(await getReputation(data.seller));
      } catch (err: any) {
        console.error(err);
        if (!silent) setError(err.message || "No se pudo cargar la orden.");
      } finally {
        if (!silent) setLoading(false);
      }
    },
    [orderId]
  );

  useEffect(() => {
    if (!isNaN(orderId)) fetchOrderData();
  }, [orderId, fetchOrderData]);

  // Refresco automático: comprador y vendedor ven los cambios del otro sin recargar
  useEffect(() => {
    if (isNaN(orderId)) return;
    const t = setInterval(() => fetchOrderData(true), 8000);
    return () => clearInterval(t);
  }, [orderId, fetchOrderData]);

  useEffect(() => {
    const t = setInterval(() => setNow(Math.floor(Date.now() / 1000)), 1000);
    return () => clearInterval(t);
  }, []);

  // Verifica que la evidencia guardada off-chain coincide con el hash on-chain
  useEffect(() => {
    const ev = offchain?.evidence;
    if (!ev || !order?.evidenceHash) {
      setEvidenceVerified(null);
      return;
    }
    sha256Hex(evidencePayload(ev.carrier, ev.guide_number, ev.photo_data_url)).then((h) =>
      setEvidenceVerified(h === order.evidenceHash)
    );
  }, [offchain?.evidence, order?.evidenceHash]);

  const runAction = async (
    label: string,
    kind: string,
    fn: () => Promise<{ hash: string }>,
    note?: string,
    photoDataUrl?: string
  ) => {
    if (!address) {
      alert("Conectá tu billetera Freighter primero.");
      return false;
    }
    try {
      setActionLoading(true);
      const res = await fn();
      setLastTx({ label, hash: res.hash });
      await saveEvent(orderId, { kind, txHash: res.hash, actor: address, note, photoDataUrl });
      await fetchOrderData(true);
      return true;
    } catch (err: any) {
      alert(`Error: ${err.message || err}`);
      return false;
    } finally {
      setActionLoading(false);
    }
  };

  const handleFund = () =>
    runAction("Pago bloqueado en escrow", "funded", () =>
      fundOrder({ orderId, buyerAddress: address! })
    );

  const handlePhoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setPhotoDataUrl(await compressImage(file));
    } catch {
      alert("No se pudo leer la imagen.");
    }
  };

  const handleDisputePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setUploadingDisputePhoto(true);
      const compressed = await compressImage(file);
      setDisputePhotoDataUrl(compressed);
    } catch (err) {
      console.error(err);
      alert("No se pudo leer la imagen.");
    } finally {
      setUploadingDisputePhoto(false);
    }
  };

  const handleMarkShipped = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!address) {
      alert("Conectá tu billetera Freighter primero.");
      return;
    }
    const hash = await sha256Hex(evidencePayload(busCompany, guideNumber, photoDataUrl));
    // La evidencia se guarda antes de la tx para que el árbitro siempre la tenga
    await saveEvidence(orderId, {
      carrier: busCompany.trim(),
      guideNumber: guideNumber.trim(),
      photoDataUrl,
      evidenceHash: hash,
    });
    await runAction(
      "Envío registrado on-chain",
      "shipped",
      () => markShipped({ orderId, sellerAddress: address, evidenceHashHex: hash }),
      `${busCompany.trim()} · guía ${guideNumber.trim()}`
    );
  };

  const handleConfirm = () => {
    if (!confirm("¿Confirmás que recibiste el paquete conforme? Esto liberará los fondos al vendedor.")) {
      return;
    }
    runAction("Pago liberado al vendedor", "completed", () =>
      confirmReceived({ orderId, buyerAddress: address! })
    );
  };

  const handleDispute = async (e: React.FormEvent) => {
    e.preventDefault();
    const ok = await runAction(
      "Disputa abierta",
      "disputed",
      () => openDispute({ orderId, callerAddress: address! }),
      disputeMotive.trim(),
      disputePhotoDataUrl || undefined
    );
    if (ok) {
      setShowDisputeForm(false);
      setDisputePhotoDataUrl(null);
    }
  };

  const handleClaim = () =>
    runAction("Liberación automática cobrada", "timeout", () =>
      claimAfterTimeout({ orderId, sellerAddress: address! })
    );

  const handleRefund = () =>
    runAction("Reembolso recibido", "refunded", () =>
      refundIfNotShipped({ orderId, buyerAddress: address! })
    );

  const shareUrl = typeof window !== "undefined" ? window.location.href.split("?")[0] : "";

  const handleCopy = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
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

  const isSeller = !!address && address === order.seller;
  const isBuyer = !!address && address === order.buyer;
  const role = isSeller ? "Vendedor" : isBuyer ? "Comprador" : address ? "Visitante" : null;

  const meta = offchain?.meta;
  const evidence = offchain?.evidence;
  const events = offchain?.events ?? [];

  const shipRemaining = order.fundedAt + order.shipDeadlineSecs - now;
  const confirmRemaining = order.shippedAt + order.confirmWindowSecs - now;

  const steps = ["Created", "Funded", "Shipped", "Completed"];
  const currentStepIndex = steps.indexOf(order.status);

  const ConnectButton = ({ label }: { label: string }) => (
    <button
      onClick={connect}
      disabled={isConnecting}
      className="w-full sm:w-auto px-6 py-3 rounded-xl bg-emerald-500 text-slate-950 font-bold text-xs"
    >
      {isConnecting ? "Conectando..." : label}
    </button>
  );

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      {/* Navegación */}
      <div className="flex items-center justify-between mb-6">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-white transition"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Inicio
        </Link>
        <div className="flex items-center gap-3">
          {role && (
            <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
              Estás viendo como: {role}
            </span>
          )}
          <button
            onClick={() => fetchOrderData()}
            className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-emerald-400 transition"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Actualizar
          </button>
        </div>
      </div>

      {/* Última transacción */}
      {lastTx && (
        <div className="mb-6 p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <span className="text-emerald-300 font-semibold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" /> {lastTx.label}
          </span>
          <a
            href={explorerTxUrl(lastTx.hash)}
            target="_blank"
            rel="noreferrer"
            className="font-mono text-emerald-400 hover:underline inline-flex items-center gap-1"
          >
            Ver tx {lastTx.hash.slice(0, 8)}…{lastTx.hash.slice(-6)}
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      )}

      <div className="p-6 sm:p-8 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-8">
        {/* Encabezado */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-mono font-bold text-slate-400">ORDEN #{order.id}</span>
              <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                Encomienda P2P
              </span>
            </div>
            {meta?.title && (
              <p className="text-base font-semibold text-slate-200 flex items-center gap-2">
                <Package className="w-4 h-4 text-emerald-400" />
                {meta.title}
              </p>
            )}
            <h1 className="text-2xl font-extrabold text-white">
              {order.amount} XLM{" "}
              <span className="text-sm font-normal text-slate-400">en custodia</span>
            </h1>
            {meta?.origin_city && meta?.dest_city && (
              <p className="text-xs text-slate-400 mt-1 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5" />
                {meta.origin_city} → {meta.dest_city}
              </p>
            )}
          </div>

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
                <Undo2 className="w-3.5 h-3.5" />
                Reembolsada
              </span>
            )}
          </div>
        </div>

        {/* Barra de progreso (solo camino feliz) */}
        {order.status !== "Disputed" && order.status !== "Refunded" && (
          <div className="w-full">
            <div className="grid grid-cols-4 gap-2 text-center text-xs font-medium mb-2">
              {["1. Creada", "2. Bloqueada", "3. Enviada", "4. Entregada"].map((label, i) => (
                <span key={label} className={currentStepIndex >= i ? "text-emerald-400" : "text-slate-600"}>
                  {label}
                </span>
              ))}
            </div>
            <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-500"
                style={{ width: `${((currentStepIndex + 1) / 4) * 100}%` }}
              />
            </div>
          </div>
        )}

        {/* Partes */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800">
            <p className="text-slate-500 font-semibold uppercase tracking-wider mb-1 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5" /> Vendedor {isSeller && <span className="text-emerald-400">(vos)</span>}
            </p>
            <p className="font-mono text-slate-200 truncate">{order.seller}</p>
            {reputation && (
              <p className="text-[11px] text-emerald-400 mt-2 font-medium">
                ★ Reputación on-chain: {reputation.completed} tratos exitosos · {reputation.disputesLost} disputas perdidas
              </p>
            )}
          </div>

          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800">
            <p className="text-slate-500 font-semibold uppercase tracking-wider mb-1 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5" /> Comprador {isBuyer && <span className="text-emerald-400">(vos)</span>}
            </p>
            <p className="font-mono text-slate-200 truncate">
              {order.buyer || "Aún no asignado (esperando depósito)"}
            </p>
          </div>
        </div>

        {/* Evidencia de envío */}
        {order.evidenceHash && (
          <div className="p-4 rounded-2xl bg-slate-950 border border-purple-500/20 text-xs space-y-3">
            <p className="text-purple-400 font-semibold uppercase tracking-wider">Evidencia de envío</p>
            {evidence && (
              <div className="flex flex-col sm:flex-row gap-4">
                {evidence.photo_data_url && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={evidence.photo_data_url}
                    alt="Foto del paquete con la guía"
                    className="w-full sm:w-40 h-40 object-cover rounded-xl border border-slate-800"
                  />
                )}
                <div className="space-y-1 text-slate-300">
                  <p><span className="text-slate-500">Empresa:</span> {evidence.carrier}</p>
                  <p><span className="text-slate-500">N° de guía:</span> {evidence.guide_number}</p>
                  {evidenceVerified === true && (
                    <p className="text-emerald-400 font-semibold flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5" /> Coincide con el hash registrado on-chain
                    </p>
                  )}
                  {evidenceVerified === false && (
                    <p className="text-rose-400 font-semibold flex items-center gap-1">
                      <AlertTriangle className="w-3.5 h-3.5" /> No coincide con el hash on-chain
                    </p>
                  )}
                </div>
              </div>
            )}
            <div>
              <p className="text-slate-500 mb-0.5">Hash on-chain (SHA-256):</p>
              <p className="font-mono text-slate-300 break-all">{order.evidenceHash}</p>
            </div>
          </div>
        )}

        {/* ACCIONES */}
        <div className="pt-2">
          {/* CREATED */}
          {order.status === "Created" &&
            (isSeller ? (
              <div className="p-6 rounded-2xl bg-amber-500/5 border border-amber-500/20 space-y-4">
                <div>
                  <h3 className="font-bold text-white text-base">Compartí el link con tu comprador</h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Cuando pague, el dinero quedará bloqueado en el contrato y esta página se actualizará sola.
                  </p>
                </div>
                <div className="flex items-center gap-2 p-3 rounded-xl bg-slate-950 border border-slate-800">
                  <input
                    readOnly
                    value={shareUrl}
                    className="bg-transparent text-xs text-emerald-400 font-mono w-full focus:outline-none"
                  />
                  <button
                    onClick={handleCopy}
                    className="px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold text-xs flex items-center gap-1.5 shrink-0"
                  >
                    {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    {copied ? "Copiado" : "Copiar"}
                  </button>
                </div>
                <a
                  href={`https://wa.me/?text=${encodeURIComponent(
                    `Hola! Pagá de forma segura con Chaski: el dinero queda bloqueado hasta que recibas el paquete. ${shareUrl}`
                  )}`}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm transition"
                >
                  <Share2 className="w-4 h-4" />
                  Compartir por WhatsApp
                </a>
              </div>
            ) : (
              <div className="p-6 rounded-2xl bg-emerald-500/5 border border-emerald-500/20 text-center space-y-4">
                <div>
                  <h3 className="font-bold text-white text-base">Asegurar Pago con Escrow</h3>
                  <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
                    Al pagar, los {order.amount} XLM quedan bloqueados en el contrato Soroban. El vendedor
                    solo cobrará cuando confirmes que llegó el paquete.
                  </p>
                </div>
                {address ? (
                  <button
                    onClick={handleFund}
                    disabled={actionLoading}
                    className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold text-sm transition shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 mx-auto disabled:opacity-50"
                  >
                    {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Lock className="w-4 h-4" />}
                    Pagar {order.amount} XLM y Asegurar Fondos
                  </button>
                ) : (
                  <ConnectButton label="Conectar Freighter para Pagar" />
                )}
              </div>
            ))}

          {/* FUNDED */}
          {order.status === "Funded" && isSeller && (
            <form
              onSubmit={handleMarkShipped}
              className="p-6 rounded-2xl bg-blue-500/5 border border-blue-500/20 space-y-4"
            >
              <div>
                <h3 className="font-bold text-white text-base">Despachar Encomienda</h3>
                <p className="text-xs text-slate-400 mt-1">
                  El pago ya está bloqueado. Llevá el paquete a la flota y subí la guía y la foto: su hash
                  queda registrado on-chain. Tenés{" "}
                  <span className="font-mono text-blue-300">{formatRemaining(shipRemaining)}</span> para
                  despachar antes de que el comprador pueda pedir reembolso.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block text-slate-400 font-medium mb-1">Empresa de Transporte / Flota</label>
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
                  <label className="block text-slate-400 font-medium mb-1">Número de Guía / Factura</label>
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

              <div className="p-4 rounded-xl border border-dashed border-slate-700 bg-slate-950/60 text-center">
                <input type="file" accept="image/*" id="guide-photo" className="hidden" onChange={handlePhoto} />
                <label
                  htmlFor="guide-photo"
                  className="cursor-pointer flex flex-col items-center justify-center text-xs text-slate-400 hover:text-white gap-2"
                >
                  {photoDataUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={photoDataUrl} alt="Vista previa" className="h-32 rounded-lg object-cover" />
                  ) : (
                    <Upload className="w-5 h-5 text-blue-400" />
                  )}
                  <span>
                    {photoDataUrl ? "✓ Foto cargada (tocá para cambiarla)" : "Subir foto del paquete con el sticker de guía"}
                  </span>
                </label>
              </div>

              <button
                type="submit"
                disabled={actionLoading}
                className="w-full py-3.5 rounded-xl bg-blue-500 hover:bg-blue-400 text-slate-950 font-bold text-sm transition flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Truck className="w-4 h-4" />}
                Confirmar Envío y Registrar Evidencia On-Chain
              </button>
            </form>
          )}

          {order.status === "Funded" && !isSeller && (
            <div className="p-6 rounded-2xl bg-blue-500/5 border border-blue-500/20 text-center space-y-3">
              <Lock className="w-7 h-7 text-blue-400 mx-auto" />
              <h3 className="font-bold text-white text-base">Tu dinero está bloqueado en el contrato</h3>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                Esperando que el vendedor despache la encomienda. Si no lo hace a tiempo, podés recuperar tu dinero.
              </p>
              <p className="text-xs text-slate-300">
                Plazo de despacho:{" "}
                <span className="font-mono font-bold text-blue-300">{formatRemaining(shipRemaining)}</span>
              </p>
              {isBuyer && shipRemaining <= 0 && (
                <button
                  onClick={handleRefund}
                  disabled={actionLoading}
                  className="px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm inline-flex items-center gap-2 disabled:opacity-50"
                >
                  {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Undo2 className="w-4 h-4" />}
                  Recuperar mi dinero (no se despachó)
                </button>
              )}
              {!address && <ConnectButton label="Conectar Freighter" />}
            </div>
          )}

          {/* SHIPPED */}
          {order.status === "Shipped" && (
            <div className="p-6 rounded-2xl bg-purple-500/5 border border-purple-500/20 text-center space-y-4">
              <div>
                <h3 className="font-bold text-white text-base">Paquete en Camino</h3>
                <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
                  {isSeller
                    ? "Esperando que el comprador confirme la recepción. Si no responde dentro del plazo, podés cobrar automáticamente."
                    : "Cuando retires tu paquete en la terminal y verifiques que está en orden, confirmá para liberar los fondos."}
                </p>
                <p className="text-xs text-slate-300 mt-3">
                  Liberación automática al vendedor en:{" "}
                  <span className="font-mono font-bold text-purple-300">{formatRemaining(confirmRemaining)}</span>
                </p>
              </div>

              {isBuyer && (
                <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                  <button
                    onClick={handleConfirm}
                    disabled={actionLoading}
                    className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm transition flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                    Confirmar Recepción y Liberar Pago
                  </button>
                </div>
              )}

              {isSeller && confirmRemaining <= 0 && (
                <button
                  onClick={handleClaim}
                  disabled={actionLoading}
                  className="px-6 py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm inline-flex items-center gap-2 disabled:opacity-50"
                >
                  {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Clock className="w-4 h-4" />}
                  Cobrar por plazo vencido
                </button>
              )}

              {(isBuyer || isSeller) &&
                (showDisputeForm ? (
                  <form onSubmit={handleDispute} className="text-left space-y-3 max-w-md mx-auto">
                    <div>
                      <label className="block text-xs text-slate-400 font-medium mb-1">
                        Motivo de la disputa (lo verá el árbitro) *
                      </label>
                      <textarea
                        required
                        value={disputeMotive}
                        onChange={(e) => setDisputeMotive(e.target.value)}
                        rows={3}
                        placeholder="Ej. El paquete llegó vacío / el producto está roto o no coincide"
                        className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-rose-500"
                      />
                    </div>

                    <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2">
                      <label className="block text-xs text-slate-400 font-medium">
                        Foto de evidencia del reclamo (opcional):
                      </label>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleDisputePhotoChange}
                        disabled={uploadingDisputePhoto || actionLoading}
                        className="text-xs text-slate-400 file:mr-2 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-slate-800 file:text-slate-200 hover:file:bg-slate-700 cursor-pointer w-full"
                      />
                      {uploadingDisputePhoto && (
                        <p className="text-[11px] text-amber-400 animate-pulse">Comprimiendo imagen...</p>
                      )}
                      {disputePhotoDataUrl && (
                        <div className="relative inline-block mt-1">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={disputePhotoDataUrl}
                            alt="Evidencia reclamo"
                            className="w-24 h-24 object-cover rounded-lg border border-rose-500/40"
                          />
                          <button
                            type="button"
                            onClick={() => setDisputePhotoDataUrl(null)}
                            className="absolute -top-1.5 -right-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center font-bold shadow"
                          >
                            ×
                          </button>
                        </div>
                      )}
                    </div>

                    <div className="flex gap-2">
                      <button
                        type="submit"
                        disabled={actionLoading || uploadingDisputePhoto}
                        className="flex-1 py-2.5 rounded-xl bg-rose-500 hover:bg-rose-400 text-white font-bold text-xs disabled:opacity-50"
                      >
                        {actionLoading ? "Enviando..." : "Abrir disputa"}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setShowDisputeForm(false);
                          setDisputePhotoDataUrl(null);
                        }}
                        className="px-4 py-2.5 rounded-xl bg-slate-800 text-slate-300 text-xs"
                      >
                        Cancelar
                      </button>
                    </div>
                  </form>
                ) : (
                  <button
                    onClick={() => setShowDisputeForm(true)}
                    disabled={actionLoading}
                    className="w-full sm:w-auto px-6 py-3 rounded-xl bg-slate-800 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 text-sm font-semibold transition inline-flex items-center justify-center gap-2"
                  >
                    <AlertTriangle className="w-4 h-4" />
                    Hay un problema · Abrir Disputa
                  </button>
                ))}

              {!address && <ConnectButton label="Conectar Freighter" />}
            </div>
          )}

          {/* COMPLETED */}
          {order.status === "Completed" && (
            <div className="p-6 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-center space-y-2">
              <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
              <h3 className="text-lg font-bold text-white">¡Trato Completado con Éxito!</h3>
              <p className="text-xs text-slate-300 max-w-md mx-auto">
                Los fondos fueron transferidos a la billetera del vendedor y se registró reputación positiva on-chain.
              </p>
            </div>
          )}

          {/* DISPUTED */}
          {order.status === "Disputed" && (
            <div className="p-6 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-center space-y-3">
              <AlertTriangle className="w-8 h-8 text-rose-400 mx-auto" />
              <h3 className="text-lg font-bold text-white">Orden en Revisión por Árbitro</h3>
              <p className="text-xs text-slate-300 max-w-md mx-auto">
                Los fondos siguen bloqueados mientras el árbitro revisa la guía, la foto del paquete y el motivo.
              </p>
              <Link
                href={`/arbitro?orden=${order.id}`}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-rose-400 underline underline-offset-4"
              >
                Ir al Panel de Árbitros ↗
              </Link>
            </div>
          )}

          {/* REFUNDED */}
          {order.status === "Refunded" && (
            <div className="p-6 rounded-2xl bg-slate-800/60 border border-slate-700 text-center space-y-2">
              <Undo2 className="w-8 h-8 text-slate-300 mx-auto" />
              <h3 className="text-lg font-bold text-white">Dinero devuelto al comprador</h3>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                El contrato reembolsó los {order.amount} XLM al comprador.
              </p>
            </div>
          )}
        </div>

        {/* Historial de transacciones */}
        {events.length > 0 && (
          <div className="pt-6 border-t border-slate-800">
            <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <History className="w-3.5 h-3.5" /> Historial on-chain
            </p>
            <ol className="space-y-2">
              {events.map((ev, i) => (
                <li key={i} className="text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-1 p-3 rounded-xl bg-slate-950 border border-slate-800">
                  <div>
                    <span className="text-slate-200 font-medium">{EVENT_LABELS[ev.kind] ?? ev.kind}</span>
                    {ev.actor && <span className="text-slate-500 font-mono ml-2">{shortAddr(ev.actor)}</span>}
                    {ev.note && <p className="text-slate-400 mt-0.5">“{ev.note}”</p>}
                  </div>
                  {ev.tx_hash && (
                    <a
                      href={explorerTxUrl(ev.tx_hash)}
                      target="_blank"
                      rel="noreferrer"
                      className="font-mono text-emerald-400 hover:underline inline-flex items-center gap-1 shrink-0"
                    >
                      {ev.tx_hash.slice(0, 8)}… <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </li>
              ))}
            </ol>
          </div>
        )}
      </div>
    </div>
  );
}
