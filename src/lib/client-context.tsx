import { createContext, useContext, ReactNode } from "react";
import { Client } from "./types";

// Single-workspace context. Multi-tenant client switching will be wired
// in when the backend exposes a real organizations source.
const WORKSPACE: Client = {
  id: "sek",
  name: "SEKINFRA Internal",
  industry: "Operating system",
  initial: "S",
};

interface Ctx {
  client: Client;
  setClientId: (id: string) => void;
  clients: Client[];
}

const ClientContext = createContext<Ctx | null>(null);

export function ClientProvider({ children }: { children: ReactNode }) {
  return (
    <ClientContext.Provider value={{ client: WORKSPACE, setClientId: () => {}, clients: [WORKSPACE] }}>
      {children}
    </ClientContext.Provider>
  );
}

export function useClient() {
  const ctx = useContext(ClientContext);
  if (!ctx) throw new Error("useClient must be used within ClientProvider");
  return ctx;
}
