"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import {
  connectWallet,
  getConnectedAddress,
  isFreighterAvailable,
} from "@/lib/stellar";

interface WalletContextType {
  address: string | null;
  isConnecting: boolean;
  hasFreighter: boolean;
  connect: () => Promise<void>;
  disconnect: () => void;
}

const WalletContext = createContext<WalletContextType>({
  address: null,
  isConnecting: false,
  hasFreighter: false,
  connect: async () => {},
  disconnect: () => {},
});

export function WalletProvider({ children }: { children: React.ReactNode }) {
  const [address, setAddress] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [hasFreighter, setHasFreighter] = useState(false);

  useEffect(() => {
    async function check() {
      const available = await isFreighterAvailable();
      setHasFreighter(available);
      if (available) {
        const saved = await getConnectedAddress();
        if (saved) setAddress(saved);
      }
    }
    check();
  }, []);

  const connect = async () => {
    try {
      setIsConnecting(true);
      const addr = await connectWallet();
      setAddress(addr);
    } catch (err: any) {
      alert(err.message || "Error al conectar Freighter");
    } finally {
      setIsConnecting(false);
    }
  };

  const disconnect = () => {
    setAddress(null);
  };

  return (
    <WalletContext.Provider
      value={{ address, isConnecting, hasFreighter, connect, disconnect }}
    >
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet() {
  return useContext(WalletContext);
}
