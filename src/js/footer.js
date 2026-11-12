/* ─── FOOTER LINK COLUMNS ──────────────────────────────────────
   The Services, Support and Legal columns are <details open> so
   their links show on desktop without any script: browsers now
   hide a closed <details> with content-visibility: hidden
   !important, which CSS can't override.

   At 1024px and below they become an accordion, collapsed until
   tapped. Without this script they just stay expanded.          */
(() => {
  const compact = window.matchMedia('(max-width: 1024px)');
  const sync = () => {
    document.querySelectorAll('.footer-acc').forEach(d => { d.open = !compact.matches; });
  };
  sync();
  compact.addEventListener('change', sync);
})();
