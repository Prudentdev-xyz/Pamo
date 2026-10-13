/**
 * Runs in <head> on the landing page only, before React loads, so nothing flashes: it marks <html> with what is
 * about to animate. The intro plays on every load of the landing page, so a phone tab that stays open for days
 * still shows it on a refresh. Coming back to the landing page from inside the app does not replay it.
 * If the page's script never arrives, everything is shown after four seconds.
 */
export const LANDING_BOOT = `(function(){if(location.pathname!=='/')return;var d=document.documentElement;try{var r=matchMedia('(prefers-reduced-motion: reduce)').matches;if(!r)d.dataset.motion='on';if(r)d.dataset.intro='seen'}catch(e){d.dataset.intro='seen'}setTimeout(function(){if(!d.dataset.ready){delete d.dataset.motion;d.dataset.intro='seen'}},4000)})()`;
