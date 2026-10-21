/**
 * Makes the phone menu button work before the page's scripts have finished
 * loading. On a slow connection the button is on screen several seconds before
 * the main script arrives, and a tap in that gap used to do nothing.
 *
 * This tiny script runs straight away and handles taps until SiteHeader's own
 * code takes over (it sets `hydrated`). It only opens and closes the menu; the
 * page-scroll lock stays with SiteHeader so the two never disagree about it.
 */
export const EARLY_MENU_SCRIPT = `(function(){
  if (window.__dpMenu) return;
  window.__dpMenu = { hydrated: false };
  document.addEventListener("click", function (event) {
    if (window.__dpMenu.hydrated) return;
    var target = event.target;
    var toggle = target && target.closest ? target.closest(".dp-menu-toggle") : null;
    var nav = toggle ? document.querySelector(".dp-nav") : null;
    if (!toggle || !nav) return;
    var open = !nav.classList.contains("open");
    nav.classList.toggle("open", open);
    toggle.setAttribute("aria-expanded", open ? "true" : "false");
    toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
  });
})();`;
