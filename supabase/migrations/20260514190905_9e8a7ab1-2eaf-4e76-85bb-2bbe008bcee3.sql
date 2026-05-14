
-- Operational tables for SekInfra modules

CREATE TABLE public.alerts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  severity text NOT NULL DEFAULT 'info',
  status text NOT NULL DEFAULT 'active',
  source text,
  service text,
  message text NOT NULL,
  payload jsonb,
  acknowledged_at timestamptz,
  resolved_at timestamptz
);

CREATE TABLE public.infrastructure_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  service_name text NOT NULL,
  status text NOT NULL DEFAULT 'unknown',
  source text,
  message text,
  payload jsonb
);

CREATE TABLE public.reliability_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  event_type text NOT NULL,
  service text,
  severity text NOT NULL DEFAULT 'info',
  message text,
  resolved_at timestamptz,
  payload jsonb
);

CREATE INDEX idx_alerts_created_at ON public.alerts (created_at DESC);
CREATE INDEX idx_alerts_status ON public.alerts (status);
CREATE INDEX idx_infra_events_created_at ON public.infrastructure_events (created_at DESC);
CREATE INDEX idx_reliability_events_created_at ON public.reliability_events (created_at DESC);

ALTER TABLE public.alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.infrastructure_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reliability_events ENABLE ROW LEVEL SECURITY;

-- Authenticated operators can read all rows
CREATE POLICY "Authenticated users can view alerts"
  ON public.alerts FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can view infrastructure_events"
  ON public.infrastructure_events FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can view reliability_events"
  ON public.reliability_events FOR SELECT TO authenticated USING (true);

-- Only admins can write
CREATE POLICY "Admins can manage alerts"
  ON public.alerts FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can manage infrastructure_events"
  ON public.infrastructure_events FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can manage reliability_events"
  ON public.reliability_events FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));
