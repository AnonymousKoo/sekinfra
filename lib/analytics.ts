export type WebsiteEvent="homepage_primary_cta_clicked"|"homepage_secondary_cta_clicked"|"problem_selected"|"outcome_explored"|"diagnostic_started"|"process_stage_explored"|"avuhz_section_explored"|"personalization_started"|"personalization_changed"|"personalization_reset"|"contextual_outcome_explored"|"contextual_diagnostic_preview_viewed";
export type EventProperties=Record<string,string|number|boolean|undefined>;
/** Vendor-free event boundary; intentionally has no side effects or network activity. */
export function trackEvent(_event:WebsiteEvent,_properties?:EventProperties){void _event;void _properties;}
