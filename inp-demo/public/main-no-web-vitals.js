/*
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

// import {onINP} from 'https://unpkg.com/web-vitals@5.1.0/dist/web-vitals.js?module';

const FRAME = 16; // Milliseconds per frame at 60hz
const SPEED = 3000; // Milliseconds per one full revolution.

function $(selector) {
  return document.querySelector(selector);
}

function $$(selector) {
  return [...document.querySelectorAll(selector)];
}

let lastClockTime = performance.now();
function time() {
  return performance.now() - lastClockTime;
}

let isClockEnabled = true;
let startTime = performance.now();
let lastFrameTime = startTime;

function updateClock() {
  if (isClockEnabled) {
    const now = performance.now();

    $('#clock').style.transform = `rotate(${now / SPEED}turn)`;

    // The angle offset, based on the time of the last frame.
    const offset = Math.max(10, 360 * ((now - lastFrameTime) / SPEED));

    $('#clock').style.background = `conic-gradient(#fff,
        #fff ${360 - offset}deg, hsl(${Math.max(
      0,
      120 - offset
    )}deg, 100%, 50%))`;

    // Play catch up by double the frame rate, but don't fall more than 1 turn behind.
    lastFrameTime = Math.min(
      now,
      Math.max(now - SPEED, lastFrameTime + FRAME * 2)
    );

    requestAnimationFrame(updateClock);
  }
}

function block(blockingTime = 0) {
  const blockingStart = performance.now();
  while (performance.now() < blockingStart + blockingTime) {
    // Block...
  }
}

function periodicBlock() {
  const amount = Number($('#periodic-blocking-amount').value);
  const max = Number($('#periodic-blocking-amount').max);

  block(Math.random() * amount);

  // Randomly block (based on amount) three times per revolution.
  setTimeout(periodicBlock, Math.random() * (SPEED / 3));
}

function logEvents() {
  let lastTenEntries = [];
  let firstInteractionId;
  const log = $('#event-log');
  const getInteractionCount = (entry) => {
    // This code is an estimate until proper interactionCount is supported.
    return Math.round((entry.interactionId - firstInteractionId) / 7) + 1;
  };

  new PerformanceObserver((list) => {
    for (const entry of list.getEntries()) {
      if (entry.interactionId) {
        if (!firstInteractionId) {
          firstInteractionId = entry.interactionId;
        }
        const interactionCount = getInteractionCount(entry);
        const tr = document.createElement('tr');
        tr.innerHTML = `
          <td>${interactionCount}</td>
          <td>${entry.name}</td>
          <td class="value">${entry.duration}</td>
          <td class="value">
            <code>${new Date().toISOString().slice(11)}</code>
          </td>
        `;
        log.prepend(tr);
      }
    }
  }).observe({type: 'event', durationThreshold: 16});
}

function initialize() {
  // Attempt to get stored settings from localStorage.
  try {
    const config = JSON.parse(localStorage.getItem('config'));
    for (const [key, value] of Object.entries(config)) {
      if (typeof value === 'boolean') {
        $(`input#${key}`).checked = value;
      } else {
        $(`input#${key}`).value = value;
      }
    }
  } catch (error) {
    // Do nothing.
  }

  // Persist settings to localstorage when the user navigates away.
  addEventListener('pagehide', () => {
    try {
      localStorage.setItem(
        'config',
        JSON.stringify(
          Object.fromEntries(
            $$('input[id]').map((input) => {
              if (input.type === 'checkbox') {
                return [input.id, input.checked];
              }
              return [input.id, input.value];
            })
          )
        )
      );
    } catch (error) {
      // Do nothing.
    }
  });

  addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') {
      lastFrameTime = performance.now();
    }
  });

  // Initialize event listener blocking time.
  ['keydown', 'keyup', 'pointerdown', 'pointerup'].forEach((type) => {
    const input = $(`#${type}-blocking-time`);
    const value = $(`#${type}-blocking-time-value`);
    value.textContent = `(${input.value}ms)`;
    addEventListener(type, (event) => block(Number(input.value)), true);
    input.addEventListener('input', () => {
      value.textContent = `(${input.value}ms)`;
    });
  });

  function onClockToggle() {
    isClockEnabled = $('#clock-toggle').checked;
    lastFrameTime = performance.now();

    if (isClockEnabled) {
      $('#clock').classList.add('active');
      updateClock();
    } else {
      $('#clock').classList.remove('active');
    }
  }
  $('#clock-toggle').addEventListener('change', onClockToggle);
  onClockToggle();

  logEvents();
  updateClock();
  periodicBlock();

  // Log INP any time its value changes.
  // onINP((inp) => ($('#inp-value').innerHTML = inp.value), {
  //   reportAllChanges: true,
  //   durationThreshold: 0,
  // });
}

if (
  'PerformanceEventTiming' in self &&
  'interactionId' in PerformanceEventTiming.prototype
) {
  initialize();
} else {
  document.body.classList.add('unsupported');
  alert(
    [
      `Oops, this browser does not fully support the Event Timing API,`,
      `which is required for this demo.`,
    ].join(' ')
  );
}
