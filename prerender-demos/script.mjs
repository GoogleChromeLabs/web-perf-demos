

document.addEventListener('prerenderingchange', (e) => {
  console.log(e);
  document.getElementById('no-prerender')?.remove();
});

// import { onLCP } from "./webvitals.mjs";
// import { onLCP } from 'https://unpkg.com/web-vitals@3.1.0?module';
import { onLCP } from 'https://unpkg.com/web-vitals@4/dist/web-vitals.attribution.js';

function trackAction(selector, actionName, args) {
  if (args) {
    document.querySelector(selector).textContent += `${actionName}:\n${JSON.stringify(args, 0, 2)}\n\n`;
  } else {
    document.querySelector(selector).textContent += `${actionName}\n\n`;
  }
}

trackAction('#output1', 'initial script execution', {
  'document.prerendering': document.prerendering,
  'activationStart': performance.getEntriesByType('navigation')[0].activationStart,
  'type': performance.getEntriesByType('navigation')[0].type,
});

onLCP(({ delta, navigationType }) => {
  trackAction('#output2', 'LCP registered', {
    LCP: delta,
    didPrerender: document.prerendering || performance?.getEntriesByType?.('navigation')[0]?.activationStart > 0,
    activationStart: performance?.getEntriesByType?.('navigation')[0]?.activationStart,
    navigationType: navigationType
  });
  document.getElementById('finalise-lcp')?.remove();
});

onLCP((e) => {
  console.log(e);
});

const StartTime = new Date().toLocaleString();

trackAction('#output3', 'initial script execution', {
  'firstLoadTime': StartTime
});

window.addEventListener('pageshow', (event) => {
  // on bfcache restore, reinitialise the speculation rules to force another prerender
  const navigationType = performance.getEntriesByType('navigation')[0].type;
  if (event.persisted || navigationType == 'back_forward' ) {
    trackAction('#output4', 'Page reactivated from bfcache');
  }
});


