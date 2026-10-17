"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  ShieldCheck,
  Package,
  ArrowRight,
  Search,
  Lock,
  Truck,
  CheckCircle2,
  Zap,
  Globe2,
} from "lucide-react";
import { CONTRACT_ID } from "@/lib/stellar";

export default function HomePage() {
  const [orderSearchId, setOrderSearchId] = useState("");
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderSearchId.trim()) return;
    router.push(`/orden/${orderSearchId.trim()}`);
  };

  return (
    <div className="flex flex-col items-center">
      {/* Hero Section */}
      <section className="w-full max-w-5xl px-4 pt-16 pb-20 text-center flex flex-col items-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900 border border-slate-800 text-xs text-slate-300 mb-6 shadow-inner">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>Ideatón Stellar Bolivia 2026 · Track 02 Pagos</span>
        </div>

        {/* Hero Title */}
        <div className="flex items-center justify-center gap-4 mb-4">
          <div className="w-16 h-16 rounded-2xl overflow-hidden border-2 border-emerald-500/30 shadow-lg shadow-emerald-500/10">
            <Image
              src="/logo.jpg"
              alt="Chaski Logo"
              width={64}
              height={64}
              className="object-cover w-full h-full"
            />
          </div>
          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight bg-gradient-to-b from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
            Chaski
          </h1>
        </div>

        <p className="text-xl sm:text-2xl font-semibold text-emerald-400 max-w-2xl mb-4">
          Escrow P2P para compras entre ciudades con envío por encomienda
        </p>

        <p className="text-slate-400 text-base sm:text-lg max-w-2xl mb-10 leading-relaxed">
          Comprá y vendé por <strong>Facebook Marketplace, TikTok y WhatsApp</strong> sin
          miedo a estafas. El dinero queda bloqueado en un contrato inteligente de{" "}
          <strong>Stellar</strong> y se libera al vendedor recién cuando el paquete llega.
        </p>

        {/* Action Buttons & Search */}
        <div className="w-full max-w-xl flex flex-col sm:flex-row items-center gap-3 justify-center mb-12">
          <Link
            href="/vender"
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold text-base transition shadow-lg shadow-emerald-500/20 active:scale-95"
          >
            Crear Link de Pago
            <ArrowRight className="w-4 h-4" />
          </Link>

          {/* Quick Search */}
          <form
            onSubmit={handleSearch}
            className="w-full sm:w-auto flex-1 flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 focus-within:border-emerald-500/50 transition"
          >
            <Search className="w-4 h-4 text-slate-500 ml-1" />
            <input
              type="number"
              placeholder="Consultar Orden # (ej. 1)"
              value={orderSearchId}
              onChange={(e) => setOrderSearchId(e.target.value)}
              className="bg-transparent text-sm text-white placeholder-slate-500 focus:outline-none w-full"
            />
            <button
              type="submit"
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 transition"
            >
              Ver
            </button>
          </form>
        </div>

        {/* Live Contract Banner */}
        <div className="w-full max-w-3xl p-4 rounded-2xl bg-slate-900/50 border border-slate-800/80 backdrop-blur-sm flex flex-col sm:flex-row items-center justify-between gap-3 text-left">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-slate-400">Contrato Soroban en Testnet</p>
              <p className="text-xs font-mono text-slate-200 truncate max-w-[280px] sm:max-w-md">
                {CONTRACT_ID}
              </p>
            </div>
          </div>
          <a
            href={`https://stellar.expert/explorer/testnet/contract/${CONTRACT_ID}`}
            target="_blank"
            rel="noreferrer"
            className="text-xs font-medium text-emerald-400 hover:text-emerald-300 underline underline-offset-4 shrink-0"
          >
            Ver en Stellar Expert ↗
          </a>
        </div>
      </section>

      {/* How it Works Section */}
      <section className="w-full bg-slate-900/40 border-y border-slate-800/60 py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white mb-3">
              ¿Cómo funciona Chaski?
            </h2>
            <p className="text-slate-400 text-sm max-w-lg mx-auto">
              Cuatro pasos simples para blindar tus compras y ventas interdepartamentales
              sin intermediarios bancarios ni cobros abusivos.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {/* Step 1 */}
            <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800/80 flex flex-col items-start relative">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center font-bold text-sm mb-4">
                1
              </div>
              <h3 className="font-semibold text-white mb-2 flex items-center gap-2">
                <Package className="w-4 h-4 text-emerald-400" />
                Vendedor crea la orden
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Ingresa el producto, precio y destino. Obtiene un link de pago único para
                compartir por WhatsApp o Facebook Marketplace.
              </p>
            </div>

            {/* Step 2 */}
            <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800/80 flex flex-col items-start relative">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center font-bold text-sm mb-4">
                2
              </div>
              <h3 className="font-semibold text-white mb-2 flex items-center gap-2">
                <Lock className="w-4 h-4 text-emerald-400" />
                Comprador bloquea fondos
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                El comprador abre el link y deposita con Freighter. El dinero queda
                retenido en el contrato Soroban; nadie lo puede desviar.
              </p>
            </div>

            {/* Step 3 */}
            <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800/80 flex flex-col items-start relative">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center font-bold text-sm mb-4">
                3
              </div>
              <h3 className="font-semibold text-white mb-2 flex items-center gap-2">
                <Truck className="w-4 h-4 text-emerald-400" />
                Envío por encomienda
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                El vendedor despacha en la terminal de buses y sube el número de guía con
                foto del paquete. La prueba se registra on-chain.
              </p>
            </div>

            {/* Step 4 */}
            <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800/80 flex flex-col items-start relative">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center font-bold text-sm mb-4">
                4
              </div>
              <h3 className="font-semibold text-white mb-2 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                Recepción y liberación
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                El comprador retira el paquete, confirma en la app y el dinero se transfiere
                al vendedor en 5 segundos. Suma reputación on-chain.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Why Stellar Section */}
      <section className="w-full max-w-5xl px-4 py-20">
        <div className="text-center mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white mb-3">
            Ventajas técnicas de Stellar para Bolivia
          </h2>
          <p className="text-slate-400 text-sm max-w-lg mx-auto">
            Por qué la arquitectura descentralizada de Stellar supera a las pasarelas
            bancarias tradicionales en el comercio informal.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl bg-slate-900/50 border border-slate-800">
            <div className="p-3 w-fit rounded-xl bg-emerald-500/10 text-emerald-400 mb-4">
              <Zap className="w-5 h-5" />
            </div>
            <h3 className="font-semibold text-white mb-2">Liquidación en 5 segundos</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Sin esperar 24 a 48 horas de compensación bancaria entre departamentos. La
              liberación es inmediata tras la confirmación.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900/50 border border-slate-800">
            <div className="p-3 w-fit rounded-xl bg-emerald-500/10 text-emerald-400 mb-4">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="font-semibold text-white mb-2">Comisiones mínimas</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Tarifas de red de fracciones de centavo ($0.00001), viables para transacciones
              desde 100 hasta 5.000 Bolivianos.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900/50 border border-slate-800">
            <div className="p-3 w-fit rounded-xl bg-emerald-500/10 text-emerald-400 mb-4">
              <Globe2 className="w-5 h-5" />
            </div>
            <h3 className="font-semibold text-white mb-2">
              Rieles locales con Anchors (Pollar)
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Integrable a futuro con la infraestructura de anchors locales como Pollar
              para entrada y salida transparente en Bolivianos (QR bancario).
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
