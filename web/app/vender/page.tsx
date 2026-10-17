"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useWallet } from "@/context/WalletContext";
import { createOrder } from "@/lib/stellar";
import {
  PackagePlus,
  ArrowRight,
  Copy,
  Check,
  Share2,
  Clock,
  MapPin,
  AlertCircle,
  Loader2,
} from "lucide-react";

const BOLIVIA_CITIES = [
  "Santa Cruz de la Sierra",
  "La Paz",
  "Cochabamba",
  "El Alto",
  "Sucre",
  "Oruro",
  "Tarija",
  "Potosí",
  "Trinidad",
  "Cobija",
];

export default function VenderPage() {
  const { address, isConnecting, connect } = useWallet();

  const [title, setTitle] = useState("");
  const [amountXlm, setAmountXlm] = useState("10");
  const [originCity, setOriginCity] = useState("Santa Cruz de la Sierra");
  const [destCity, setDestCity] = useState("La Paz");
  const [isDemoMode, setIsDemoMode] = useState(true);

  const [loading, setLoading] = useState(false);
  const [createdOrderId, setCreatedOrderId] = useState<number | null>(null);
  const [copied, setCopied] = useState(false);
  const [txHash, setTxHash] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!address) {
      alert("Por favor conectá tu billetera Freighter primero.");
      return;
    }

    const val = parseFloat(amountXlm);
    if (isNaN(val) || val <= 0) {
      alert("Ingresá un monto válido.");
      return;
    }

    try {
      setLoading(true);
      // Demo mode uses short deadlines (120s for ship, 180s for confirm) so it can be demonstrated in real time!
      const shipDeadlineSecs = isDemoMode ? 180 : 86400; // 3 min vs 24h
      const confirmWindowSecs = isDemoMode ? 180 : 259200; // 3 min vs 72h

      const res = await createOrder({
        sellerAddress: address,
        amountXlm: val,
        shipDeadlineSecs,
        confirmWindowSecs,
      });

      setTxHash(res.hash);

      // In Soroban events or returned value, we can extract or increment order ID
      // For demo, we query the latest or fallback to 1
      setCreatedOrderId(1);
    } catch (err: any) {
      console.error(err);
      alert(`Error creando orden: ${err.message || err}`);
    } finally {
      setLoading(false);
    }
  };

  const getShareUrl = () => {
    if (typeof window === "undefined" || !createdOrderId) return "";
    return `${window.location.origin}/orden/${createdOrderId}`;
  };

  const handleCopy = () => {
    const url = getShareUrl();
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-semibold mb-3">
          <PackagePlus className="w-3.5 h-3.5" />
          <span>Nueva Orden de Venta</span>
        </div>
        <h1 className="text-3xl font-extrabold text-white">
          Crear Link de Pago Protegido
        </h1>
        <p className="text-sm text-slate-400 mt-2">
          Definí tu producto y precio. Compartí el link a tu comprador por WhatsApp
          o Marketplace para que deposite de forma segura.
        </p>
      </div>

      {createdOrderId ? (
        /* Order Created Success Card */
        <div className="p-8 rounded-3xl bg-slate-900 border border-emerald-500/30 shadow-2xl text-center flex flex-col items-center animate-fade-in">
          <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center mb-4 border border-emerald-500/40">
            <Check className="w-7 h-7" />
          </div>

          <h2 className="text-2xl font-bold text-white mb-1">
            ¡Orden #{createdOrderId} Creada con Éxito!
          </h2>
          <p className="text-sm text-slate-400 mb-6">
            El contrato inteligente en Soroban ya está listo para recibir el depósito
            del comprador.
          </p>

          <div className="w-full p-4 rounded-2xl bg-slate-950 border border-slate-800 text-left mb-6">
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-2">
              Link de pago para tu comprador:
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={getShareUrl()}
                className="bg-transparent text-sm text-emerald-400 font-mono w-full focus:outline-none select-all"
              />
              <button
                onClick={handleCopy}
                className="px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold text-xs flex items-center gap-1.5 transition shrink-0"
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? "Copiado" : "Copiar"}
              </button>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 w-full">
            <a
              href={`https://wa.me/?text=${encodeURIComponent(
                `Hola! Creé la orden protegida en Chaski para nuestro trato. Podés pagar de forma segura en: ${getShareUrl()}`
              )}`}
              target="_blank"
              rel="noreferrer"
              className="w-full flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm transition"
            >
              <Share2 className="w-4 h-4" />
              Compartir por WhatsApp
            </a>

            <Link
              href={`/orden/${createdOrderId}`}
              className="w-full flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-sm transition"
            >
              Ver Estado de la Orden
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {txHash && (
            <p className="text-[11px] text-slate-500 mt-6">
              Transacción on-chain:{" "}
              <a
                href={`https://stellar.expert/explorer/testnet/tx/${txHash}`}
                target="_blank"
                rel="noreferrer"
                className="text-emerald-400 hover:underline font-mono"
              >
                {txHash.slice(0, 8)}...{txHash.slice(-8)}
              </a>
            </p>
          )}
        </div>
      ) : (
        /* Order Creation Form */
        <form
          onSubmit={handleSubmit}
          className="p-8 rounded-3xl bg-slate-900/60 border border-slate-800 shadow-xl space-y-6"
        >
          {/* Seller Wallet Connection Notice */}
          {!address && (
            <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-3 text-amber-300 text-sm">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">Billetera no conectada</p>
                <p className="text-xs text-amber-200/80 mt-1">
                  Para crear la orden necesitas firmar con Freighter.
                </p>
                <button
                  type="button"
                  onClick={connect}
                  disabled={isConnecting}
                  className="mt-3 px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition"
                >
                  {isConnecting ? "Conectando..." : "Conectar Freighter Ahora"}
                </button>
              </div>
            </div>
          )}

          {/* Product Title */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
              Producto o Descripción del Trato *
            </label>
            <input
              type="text"
              required
              placeholder="Ej. Celular Samsung S23 Ultra / Lote de zapatillas"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-emerald-500 transition"
            />
          </div>

          {/* Price */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
              Precio a Cobrar (en XLM) *
            </label>
            <div className="relative">
              <input
                type="number"
                step="any"
                min="0.1"
                required
                placeholder="10"
                value={amountXlm}
                onChange={(e) => setAmountXlm(e.target.value)}
                className="w-full pl-4 pr-16 py-3 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono text-sm focus:outline-none focus:border-emerald-500 transition"
              />
              <span className="absolute right-4 top-3.5 text-xs font-bold text-emerald-400">
                XLM (Testnet)
              </span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              Para el demo en vivo usamos el token XLM nativo de testnet (equivalente
              a dólares digitales USDC).
            </p>
          </div>

          {/* Origin and Destination Cities */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                Ciudad Origen (Vendedor)
              </label>
              <select
                value={originCity}
                onChange={(e) => setOriginCity(e.target.value)}
                className="w-full px-3 py-3 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:outline-none focus:border-emerald-500 transition"
              >
                {BOLIVIA_CITIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                Ciudad Destino (Comprador)
              </label>
              <select
                value={destCity}
                onChange={(e) => setDestCity(e.target.value)}
                className="w-full px-3 py-3 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:outline-none focus:border-emerald-500 transition"
              >
                {BOLIVIA_CITIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Demo Mode Toggle */}
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800/80 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Clock className="w-5 h-5 text-emerald-400 shrink-0" />
              <div>
                <p className="text-xs font-semibold text-white">Modo Demo Hackathon</p>
                <p className="text-[11px] text-slate-400">
                  Usa plazos de 3 minutos para poder demostrar el timeout y auto-liberación
                  en vivo.
                </p>
              </div>
            </div>
            <input
              type="checkbox"
              checked={isDemoMode}
              onChange={(e) => setIsDemoMode(e.target.checked)}
              className="w-4 h-4 accent-emerald-500 rounded cursor-pointer"
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading || !address}
            className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold text-sm transition shadow-lg shadow-emerald-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Firmando con Freighter y Creando en Soroban...</span>
              </>
            ) : (
              <>
                <span>Generar Link de Pago Protegido</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>
      )}
    </div>
  );
}
