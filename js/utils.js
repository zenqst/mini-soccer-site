// ============ УТИЛИТЫ ============
function parseNum(val, def = 0) {
  if (val === '' || val === null || val === undefined) return def;
  const str = String(val).replace(',', '.').trim();
  const n = parseFloat(str);
  return isNaN(n) ? def : n;
}

function parseIntSafe(val, def = 0) {
  if (val === '' || val === null || val === undefined) return def;
  const n = parseInt(String(val).replace(/[^0-9-]/g, ''), 10);
  return isNaN(n) ? def : n;
}

function escapeHtml(str) {
  return String(str).replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
}

// ============ КУКИ ============
function setCookie(name, value, days) {
  const d = new Date();
  d.setTime(d.getTime() + (days * 24 * 60 * 60 * 1000));
  document.cookie = name + '=' + encodeURIComponent(value) + ';expires=' + d.toUTCString() + ';path=/;SameSite=Lax';
}

function getCookie(name) {
  const v = document.cookie.match('(^|;)\\s*' + name + '=([^;]*)');
  return v ? decodeURIComponent(v[2]) : null;
}

function deleteCookie(name) {
  document.cookie = name + '=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/';
}

function loadFromCookies() {
  try {
    const chunkCount = parseInt(getCookie('tournamentApp_c0') || '0', 10);
    if (chunkCount <= 0) return null;
    let json = '';
    let missing = 0;
    for (let i = 1; i <= chunkCount; i++) {
      const chunk = getCookie('tournamentApp_c' + i);
      if (chunk === null) { missing++; continue; }
      json += chunk;
    }
    if (json.length === 0) return null;
    try {
      return JSON.parse(json);
    } catch(e) {
      // JSON truncated due to missing chunks — try to salvage what we can
      // Find the last complete season object
      const lastSeasonEnd = json.lastIndexOf('},{');
      if (lastSeasonEnd > 0) {
        try {
          const partial = json.substring(0, lastSeasonEnd + 1) + ']}';
          const obj = JSON.parse(partial);
          if (obj && obj.seasons && obj.seasons.length > 0) return obj;
        } catch(e2) {}
      }
      return null;
    }
  } catch (e) { console.warn('Cookie load failed', e); return null; }
}

function clearCookieChunks() {
  const chunkCount = parseInt(getCookie('tournamentApp_c0') || '0', 10);
  for (let i = 0; i <= chunkCount; i++) deleteCookie('tournamentApp_c' + i);
}

function clearAllStorage() {
  clearCookieChunks();
  try { localStorage.removeItem('tournamentApp_v4'); } catch(e) {}
  try { localStorage.removeItem('tournamentApp_v3'); } catch(e) {}
  try { localStorage.removeItem('tournamentApp_v2'); } catch(e) {}
}

function checkUrlClearParam() {
  const params = new URLSearchParams(window.location.search);
  if (params.has('clear')) {
    clearAllStorage();
    window.history.replaceState({}, '', window.location.pathname);
    return true;
  }
  return false;
}

// ============ INDEXED DB ============
const DB_NAME = 'tournamentAppDB';
const DB_VERSION = 1;
const DB_STORE = 'data';
const DB_KEY = 'main';

function dbOpen() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => req.result.createObjectStore(DB_STORE);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function dbSave(data) {
  const db = await dbOpen();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(DB_STORE, 'readwrite');
    tx.objectStore(DB_STORE).put(data, DB_KEY);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

async function dbLoad() {
  const db = await dbOpen();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(DB_STORE, 'readonly');
    const req = tx.objectStore(DB_STORE).get(DB_KEY);
    req.onsuccess = () => resolve(req.result || null);
    req.onerror = () => reject(req.error);
  });
}

async function dbClear() {
  const db = await dbOpen();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(DB_STORE, 'readwrite');
    tx.objectStore(DB_STORE).clear();
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

async function migrateFromCookies() {
  const cookieData = loadFromCookies();
  if (!cookieData || !cookieData.seasons || cookieData.seasons.length === 0) {
    return null;
  }
  await dbSave(cookieData);
  clearCookieChunks();
  localStorage.removeItem('tournamentApp_v4');
  localStorage.removeItem('tournamentApp_v3');
  localStorage.removeItem('tournamentApp_v2');
  return cookieData;
}
