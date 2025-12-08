/*
 Copyright 2020 Google Inc. All Rights Reserved.
 Licensed under the Apache License, Version 2.0 (the "License");
 you may not use this file except in compliance with the License.
 You may obtain a copy of the License at

     http://www.apache.org/licenses/LICENSE-2.0

 Unless required by applicable law or agreed to in writing, software
 distributed under the License is distributed on an "AS IS" BASIS,
 WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 See the License for the specific language governing permissions and
 limitations under the License.
*/

var STORAGE_KEY = 'events' + location.pathname;

function getStoredState() {
  var storedState;
  try {
    storedState = JSON.parse(localStorage.getItem(STORAGE_KEY));
  } catch (err) {
    // Do nothing.
  }
  return storedState || [];
};

const windowId = Math.floor(Math.random() * (9e12 - 1)) + 1e12;


function appendStoredState(event, target, visibilityState, date, windowId) {
  var stateHistory = getStoredState();

  stateHistory.push({event: event, target: target, visibilityState: visibilityState, date: date, windowId: windowId});
  localStorage.setItem(STORAGE_KEY, JSON.stringify(stateHistory));
  updateDisplayedState();
};

function clearStoredState() {
  localStorage.removeItem('events/');
  localStorage.removeItem(STORAGE_KEY);
};

function updateDisplayedState() {
  var addRow = function(entry) {
    var tr = document.createElement('tr');
    var td1 = document.createElement('td');
    var td2 = document.createElement('td');
    var td3 = document.createElement('td');
    var td4 = document.createElement('td');
    var td5 = document.createElement('td');
    td1.innerText = entry.event;
    td2.innerText = entry.target;
    td3.innerText = entry.visibilityState;
    td4.innerText = entry.date;
    td5.innerText = entry.windowId;
    tr.appendChild(td1);
    tr.appendChild(td2);
    tr.appendChild(td3);
    tr.appendChild(td4);
    tr.appendChild(td5);
    tbody.appendChild(tr);
  };
  var removeRow = function(row) {
    row.parentNode.removeChild(row);
  };

  var tbody = document.getElementById('output');
  var entries = getStoredState();
  var rows = [].slice.call(tbody.children);
  var min = Math.min(entries.length, rows.length);
  var max = Math.max(entries.length, rows.length);

  for (var i = min; i < max; i++) {
    if (i >= rows.length) {
      addRow(entries[i]);
    } else {
      removeRow(rows[i]);
    }
  }
};

function trackEvent(event) {
  const target = (event.target === window ? '#window' : event.target.nodeName).toLowerCase();
  appendStoredState(event.persisted ? `${event.type} (persisted)` : event.type, target, document.visibilityState, new Date().toISOString(), windowId);
}

document.getElementById('clear').onclick = function() {
  clearStoredState();
  updateDisplayedState();
};

addEventListener('pointerup', trackEvent, true);
addEventListener('pointerdown', trackEvent, true);
addEventListener('keyup', trackEvent, true);
addEventListener('keydown', trackEvent, true);
addEventListener('click', trackEvent, true);
addEventListener('blur', trackEvent, true);
addEventListener('visibilitychange', trackEvent, true);
addEventListener('pagehide', trackEvent, true);
addEventListener('pageshow', trackEvent, true);
addEventListener('freeze', trackEvent, true);
addEventListener('resume', trackEvent, true);
addEventListener('beforeunload', trackEvent, true);
addEventListener('load', trackEvent, true);
addEventListener('unload', trackEvent, true);
addEventListener('prerenderingchange', trackEvent, true);

updateDisplayedState();
