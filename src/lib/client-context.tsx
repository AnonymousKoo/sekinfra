import { createContext, useContext, useState, ReactNode } from "react";
import { clients, Client } from "./mock-data";

interface Ctx {
  client: Client;
  setClientId: (id: string) => void;
  clients: Client[];
}

const ClientContext = createContext<Ctx | null>(null);

export function ClientProvider({ children }: { children: ReactNode }) {
  const [id, setId] = useState("sek");
  const client = clients.find(c => c.id === id) ?? clients[0];
  return (
    <ClientContext.Provider value={{ client, setClientId: setId, clients }}>
      {children}
    </ClientContext.Provider>
  );
}

export function useClient() {
  const ctx = useContext(ClientContext);
  if (!ctx) throw new Error("useClient must be used within ClientProvider");
  return ctx;
}
