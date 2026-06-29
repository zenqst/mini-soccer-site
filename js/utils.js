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

function saveToCookies() {
  try {
    syncCurrentSeason();
    const data = {
      version: 4,
      seasons: JSON.parse(JSON.stringify(seasons)),
      currentSeasonIdx
    };
    const json = JSON.stringify(data);
    const chunkSize = 2000;
    const chunks = Math.ceil(json.length / chunkSize);
    setCookie('tournamentApp_c0', chunks.toString(), 365);
    for (let i = 0; i < chunks; i++) {
      setCookie('tournamentApp_c' + (i + 1), json.substring(i * chunkSize, (i + 1) * chunkSize), 365);
    }
  } catch (e) { console.warn('Cookie save failed', e); }
}

function loadFromCookies() {
  try {
    const chunkCount = parseInt(getCookie('tournamentApp_c0') || '0', 10);
    if (chunkCount <= 0) return null;
    let json = '';
    for (let i = 1; i <= chunkCount; i++) {
      const chunk = getCookie('tournamentApp_c' + i);
      if (chunk === null) return null;
      json += chunk;
    }
    return JSON.parse(json);
  } catch (e) { console.warn('Cookie load failed', e); return null; }
}
