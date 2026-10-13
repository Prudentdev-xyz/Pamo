// Shared by the root layout (server) and the landing page's motion (client).

export const SEEN_KEY = "pamo-intro-seen";

/**
 * Runs in <head> on the landing page only, before React loads, so nothing flashes: it marks <html> with what is
 * about to animate.
 * If the page's script never arrives, everything is shown after four seconds.
 */
export const LANDING_BOOT = `(function(){if(location.pathname!=='/')return;var d=document.documentElement;try{var r=matchMedia('(prefers-reduced-motion: reduce)').matches;if(!r)d.dataset.motion='on';if(r||sessionStorage.getItem('${SEEN_KEY}'))d.dataset.intro='seen'}catch(e){d.dataset.intro='seen'}setTimeout(function(){if(!d.dataset.ready){delete d.dataset.motion;d.dataset.intro='seen'}},4000)})()`;
