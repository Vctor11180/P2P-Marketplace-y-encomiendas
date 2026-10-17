import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { WalletProvider } from "@/context/WalletContext";
import { Navbar } from "@/components/Navbar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Chaski — Escrow P2P para compras entre ciudades sobre Stellar",
  description:
    "El dinero del comprador queda bloqueado en un contrato inteligente de Stellar y se libera al vendedor solo cuando el paquete llega por encomienda.",
  icons: {
    icon: "/logo.jpg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className="dark h-full">
      <body
        className={`${geistSans.variable} ${geistMono.variable} min-h-full flex flex-col bg-slate-950 text-slate-100 antialiased selection:bg-emerald-500/30 selection:text-emerald-200`}
      >
        <WalletProvider>
          <Navbar />
          <main className="flex-1">{children}</main>
          <footer className="border-t border-slate-900 bg-slate-950 py-8 text-center text-xs text-slate-500">
            <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
              <p>
                © 2026 <strong>Chaski Protocol</strong> — Ideatón Stellar Bolivia
                · Track 02 Pagos y Remesas
              </p>
              <div className="flex items-center gap-4 text-slate-400">
                <a
                  href="https://stellar.expert/explorer/testnet/contract/CDXK2V4UCM7WQW74JVOIYLPZBYGQTWYWXNWF4PPJUDLJNTQ526JPML3X"
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-emerald-400 transition"
                >
                  Contrato en Testnet ↗
                </a>
                <a
                  href="https://github.com/Vctor11180/P2P-Marketplace-y-encomiendas"
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-emerald-400 transition"
                >
                  GitHub ↗
                </a>
              </div>
            </div>
          </footer>
        </WalletProvider>
      </body>
    </html>
  );
}
