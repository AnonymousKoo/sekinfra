
ALTER TABLE public.alerts
  ADD COLUMN IF NOT EXISTS lead_id uuid,
  ADD COLUMN IF NOT EXISTS type text,
  ADD COLUMN IF NOT EXISTS resolved boolean NOT NULL DEFAULT false;

CREATE INDEX IF NOT EXISTS idx_alerts_resolved ON public.alerts (resolved);
CREATE INDEX IF NOT EXISTS idx_alerts_lead_id ON public.alerts (lead_id);

-- Keep resolved flag in sync with resolved_at for back-compat
CREATE OR REPLACE FUNCTION public.alerts_sync_resolved()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF NEW.resolved_at IS NOT NULL AND NEW.resolved = false THEN
    NEW.resolved := true;
  ELSIF NEW.resolved = true AND NEW.resolved_at IS NULL THEN
    NEW.resolved_at := now();
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_alerts_sync_resolved ON public.alerts;
CREATE TRIGGER trg_alerts_sync_resolved
  BEFORE INSERT OR UPDATE ON public.alerts
  FOR EACH ROW EXECUTE FUNCTION public.alerts_sync_resolved();
