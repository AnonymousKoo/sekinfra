import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ClientProvider } from "@/lib/client-context";
import { AppShell } from "@/components/app-shell";
import Dashboard from "./pages/Dashboard";
import Pipeline from "./pages/Pipeline";
import Leads from "./pages/Leads";
import LeadDetail from "./pages/LeadDetail";
import ActivityFeed from "./pages/ActivityFeed";
import Automations from "./pages/Automations";
import FollowUpRules from "./pages/FollowUpRules";
import Analytics from "./pages/Analytics";
import SettingsPage from "./pages/Settings";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <ClientProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<AppShell><Dashboard /></AppShell>} />
            <Route path="/pipeline" element={<AppShell><Pipeline /></AppShell>} />
            <Route path="/leads" element={<AppShell><Leads /></AppShell>} />
            <Route path="/leads/:id" element={<AppShell><LeadDetail /></AppShell>} />
            <Route path="/activity" element={<AppShell><ActivityFeed /></AppShell>} />
            <Route path="/automations" element={<AppShell><Automations /></AppShell>} />
            <Route path="/automations/rules" element={<AppShell><FollowUpRules /></AppShell>} />
            <Route path="/analytics" element={<AppShell><Analytics /></AppShell>} />
            <Route path="/settings" element={<AppShell><SettingsPage /></AppShell>} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </ClientProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
