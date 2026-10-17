"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { useWallet } from "@/context/WalletContext";
import { ShieldCheck, Wallet, ExternalLink, PlusCircle, Scale } from "lucide-react";
import { CONTRACT_ID } from "@/lib/stellar";

export function Navbar() {
  const { address, isConnecting, connect, disconnect } = useWallet();

  const shortAddress = address
    ? `${address.slice(0, 5)}...${address.slice(-4)}`
    : null;

  return (
    <header className="sticky top-0 z-50 backdrop-blur-md bg-slate-950/80 border-b border-slate-800 text-white">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo & Brand */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl overflow-hidden border border-emerald-500/30 group-hover:border-emerald-400 transition">
            <Image
              src="/logo.jpg"
              alt="Chaski Logo"
              width={40}
              height={40}
              className="object-cover w-full h-full"
            />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-lg tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
                Chaski
              </span>
              <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                Testnet
              </span>
            </div>
            <p className="text-[11px] text-slate-400 hidden sm:block">
              Escrow P2P · Compras por encomienda
            </p>
          </div>
        </Link>

        {/* Navigation links */}
        <nav className="flex items-center gap-1 sm:gap-4 text-sm font-medium">
          <Link
            href="/vender"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 transition border border-emerald-500/20"
          >
            <PlusCircle className="w-4 h-4" />
            <span className="hidden sm:inline">Crear Link de Pago</span>
            <span className="sm:hidden">Vender</span>
          </Link>

          <Link
            href="/arbitro"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-900 transition"
          >
            <Scale className="w-4 h-4" />
            <span className="hidden sm:inline">Panel Árbitro</span>
          </Link>

          {/* Freighter Button */}
          {address ? (
            <div className="flex items-center gap-2">
              <button
                onClick={disconnect}
                title="Hacé clic para desconectar"
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 hover:border-slate-600 transition text-xs font-mono text-slate-200"
              >
                <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                {shortAddress}
              </button>
            </div>
          ) : (
            <button
              onClick={connect}
              disabled={isConnecting}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-semibold text-xs transition shadow-sm"
            >
              <Wallet className="w-4 h-4" />
              {isConnecting ? "Conectando..." : "Conectar Freighter"}
            </button>
          )}
        </nav>
      </div>
    </header>
  );
}
