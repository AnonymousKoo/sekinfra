/**
 * Private Command Center brand identity.
 * No source-of-truth Avuhz logo file exists in the inspected repositories,
 * so this is a self-contained, provisional typographic Avuhz mark.
 * This component is NOT imported by the public SekInfra client website.
 */
export function AvuhzBrand() {
  return <div className="flex items-center gap-3" aria-label="Avuhz Command Center">
    <span aria-hidden="true" className="avuhz-symbol flex h-12 w-12 shrink-0 items-center justify-center rounded-[14px]">
      <svg viewBox="0 0 56 56" width="34" height="34" fill="none" aria-hidden="true" focusable="false">
        <path d="M7 46L25 9h7l18 37" stroke="#b9ef70" strokeWidth="6" strokeLinecap="square" strokeLinejoin="bevel"/>
        <path d="M18 33h20" stroke="#83ded2" strokeWidth="5" strokeLinecap="square"/>
        <path d="M43.5 11.5h5" stroke="#83ded2" strokeWidth="3" strokeLinecap="square"/>
      </svg>
    </span>
    <span className="min-w-0">
      <span className="block text-[24px] font-black uppercase leading-none tracking-[.11em] text-[#effcf3]">Avuhz</span>
      <span className="mt-1.5 block text-[9px] font-bold uppercase tracking-[.24em] text-[#83c3b6]">Command Center</span>
    </span>
  </div>;
}
