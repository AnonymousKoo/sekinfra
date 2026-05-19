
CREATE TABLE IF NOT EXISTS public.incident_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  workflow_name text,
  node_name text,
  error_message text,
  severity text NOT NULL DEFAULT 'medium',
  status text NOT NULL DEFAULT 'active',
  resolved_at timestamptz,
  payload jsonb
);
ALTER TABLE public.incident_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users can view incident_logs" ON public.incident_logs FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins can manage incident_logs" ON public.incident_logs FOR ALL TO authenticated USING (has_role(auth.uid(),'admin'::app_role)) WITH CHECK (has_role(auth.uid(),'admin'::app_role));
CREATE INDEX IF NOT EXISTS idx_incident_logs_created_at ON public.incident_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_incident_logs_status ON public.incident_logs(status);

CREATE TABLE IF NOT EXISTS public.event_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  event_type text NOT NULL,
  source text,
  status text,
  message text,
  payload jsonb
);
ALTER TABLE public.event_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users can view event_logs" ON public.event_logs FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins can manage event_logs" ON public.event_logs FOR ALL TO authenticated USING (has_role(auth.uid(),'admin'::app_role)) WITH CHECK (has_role(auth.uid(),'admin'::app_role));
CREATE INDEX IF NOT EXISTS idx_event_logs_created_at ON public.event_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_event_logs_event_type ON public.event_logs(event_type);
