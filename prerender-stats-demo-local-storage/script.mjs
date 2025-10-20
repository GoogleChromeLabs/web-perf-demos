
let referrerPath;
try { referrerPath = new URL(document.referrer)?.pathname ?? '/' } catch { };
const currentPathName = window.location?.pathname;
const randomValue = Math.random().toString(36).substring(2, 10);
const date = new Date().toISOString().replace(/[-T:]/g, '').slice(0, 13);
const EXPIRATION_TIME_MS = 24 * 60 * 60 * 1000; // Example: 24 hours

function trackAction(selector, actionName, args) {
  const element = document.querySelector(selector);
  
  if (!element) {
    return;
  }

  if (args) {
    element.textContent += `${actionName}:\n${JSON.stringify(args, 0, 2)}\n\n`;
  } else {
    element.textContent += `${actionName}\n\n`;
  }
}

function addSpeculationRules() {
  const specScript = document.createElement("script");
  specScript.id = "speculationrules";
  specScript.type = "speculationrules";
  specScript.textContent = `
    {
      "prerender": [
        {
          "urls": ["next.html", "next2.html"],
          "eagerness": "moderate"
        }
      ]
    }`;
  document.body.appendChild(specScript);
}
if (!('supports' in HTMLScriptElement && HTMLScriptElement.supports('speculationrules'))) {
  trackAction('#output1', 'Speculation Rules supported on your browser: false');
} else {
  trackAction('#output1', 'Speculation Rules supported on your browser: true');
  addSpeculationRules();
  trackAction('#output2', 'Added speculationrules');
}



const refreshButton = document.querySelector('#refresh');
refreshButton?.addEventListener('click', async (event) => {
  document.querySelector('#speculationrules')?.remove();
  await Promise.resolve();
  addSpeculationRules();
});


window.addEventListener('pageshow', (event) => {
  // on bfcache restore, reinitialise the speculation rules to force another prerender
  const navigationType = performance.getEntriesByType('navigation')[0].type;
  if (event.persisted || navigationType == 'back_forward' ) {
    document.querySelector('#speculationrules')?.remove();
    addSpeculationRules();
    trackAction('#output2', 'Page reactivated: re-added speculationrules', document.querySelector('#speculationrules').text.replaceAll('\n','').replace(/  +/g,' '));
  }
});

trackAction('#output3', 'initial script execution', {
  'document.prerendering': document.prerendering,
  'activationStart': performance.getEntriesByType('navigation')[0].activationStart,
  'type': performance.getEntriesByType('navigation')[0].type,
});

function logPrerender() {
  
  if (!referrerPath) {
    console.error('Unable to get referrer');
    return;
  }
  const key = referrerPath + randomValue;
  const expirationDate = new Date(Date.now() + EXPIRATION_TIME_MS).toISOString().replace(/[-T:]/g, '').slice(0, 13);
  
  localStorage.setItem(key, JSON.stringify({ "expires": expirationDate }));
}

function cleanThisPagesLocalStorageItems() {
  
  localStorage.removeItem(currentPathName);
  
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);

    if (key && key.startsWith(currentPathName) && key != currentPathName) {
      try {
        // Decide whether to report old items if found
        localStorage.removeItem(key)
      } catch (e) {
        console.error(`Error parsing localStorage item with key ${key}:`, e);
      }
    } else {
      try {
  
        const expirationDate = new Date(Date.now() + EXPIRATION_TIME_MS).toISOString().replace(/[-T:]/g, '').slice(0, 13);
        const value = JSON.parse(localStorage.getItem(key));
        if (value.expires < expirationDate) {
          // Decide whether to report old items if found
          localStorage.removeItem(key);
        }
      } catch (e) {
        console.error(`Error parsing localStorage item with key ${key}:`, e);
      }
    }
  }
}


// This runs on pagehide to report prerenders back to analytics
// in case the page is navigated away from.
function reportPrerenders(url) {
  
  const expirationDate = new Date(Date.now() + EXPIRATION_TIME_MS).toISOString().replace(/[-T:]/g, '').slice(0, 13);
  
  if (!url) {
    console.error('No url so cannot get stats', url);
    return;
  }
  
  let reportedPerenders = 0;
  
  try {
    const value = JSON.parse(localStorage.getItem(url));
    reportedPerenders = value?.reportedPerenders ? value?.reportedPerenders : 0;
  } catch (e) {
    console.error(`Error parsing localStorage item with key ${url}:`, e);
  }
  
  let unreportedPrerenders = 0;
  
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);

    if (key && key.startsWith(url) && key != url) {
      try {
        const value = JSON.parse(localStorage.getItem(key));
        unreportedPrerenders++;
        localStorage.removeItem(key)
      } catch (e) {
        console.error(`Error parsing localStorage item with key ${key}:`, e);
      }
    }
  }
  
  reportedPerenders = reportedPerenders + unreportedPrerenders;
  
  if (unreportedPrerenders) {
    // Beacon back prerenders. We'll just console.log for now
    console.log(`Reporting ${unreportedPrerenders} prerenders for a total of ${reportedPerenders} for URL: ${url}`);
    // Update local storage for this URL
    localStorage.setItem(url, JSON.stringify({ "expires": expirationDate, "reportedPerenders": reportedPerenders }));
  }

  return reportedPerenders;
}

function reportReferrerStats(activation) {
  // Report any unreported prerenders
  const prerenders = reportPrerenders(referrerPath);
  
  if (activation) {
    // Beacon back the activation. We'll dummy it with a console.log
    console.log(`The previous page (${referrerPath}) had ${prerenders} prerenders and 1 activation.`);
  } else {
    console.log(`The previous page (${referrerPath}) had ${prerenders} prerenders and no activations'}.`);
  }
  
  trackAction('#output4', `The previous page (${referrerPath}) had ${prerenders} prerenders and ${activation ? '1 activation' : 'no activations'}.`);
  localStorage.removeItem(referrerPath)
}

function reportActivation() {
  reportReferrerStats(true);
}

// Report prerenders on moving tab
function reportOnHidden() {
  if (document.visibilityState === "hidden") {
    reportPrerenders(currentPathName);
  }
}
window.addEventListener('visibilitychange', reportOnHidden); 

// Report prerenders at end of document
addEventListener("pagehide", (event) => {
  reportPrerenders(currentPathName);
});


cleanThisPagesLocalStorageItems();

if (document.referrer && performance.getEntriesByType('navigation')[0].type !== 'reload') {

  try {
    if (document.prerendering) {
      // Page is still prerendering. Increment prerenders and report on activation.
      document.getElementById('no-prerender')?.remove();
      document.addEventListener('prerenderingchange', reportActivation, {once: true});
      logPrerender();
    } else if (performance.getEntriesByType('navigation')[0].activationStart > 0) {    
      // Page has finished prerendering. Report stats with an activation.   
      document.getElementById('no-prerender')?.remove();
      logPrerender();
      reportReferrerStats(true);
    } else if (performance.getEntriesByType('navigation')[0].activationStart === 0) {
      // Page is a normal load. Report stats without an activation
      reportReferrerStats(false);
    }
  } catch (error) {
    console.error("Error working with IndexedDB:", error);
  }
}
