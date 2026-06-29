// ============ ФЛАГИ СТРАН ============
const FLAGS = [
  // Европа
  {f:'🇪🇸', n:'Испания'}, {f:'🇬🇧', n:'Великобритания'}, {f:'🇬🇧', n:'Англия'}, {f:'🇬🇧', n:'Шотландия'},
  {f:'🇬🇧', n:'Уэльс'}, {f:'🇮🇪', n:'Ирландия'}, {f:'🇫🇷', n:'Франция'}, {f:'🇩🇪', n:'Германия'},
  {f:'🇮🇹', n:'Италия'}, {f:'🇵🇹', n:'Португалия'}, {f:'🇳🇱', n:'Нидерланды'}, {f:'🇧🇪', n:'Бельгия'},
  {f:'🇦🇹', n:'Австрия'}, {f:'🇨🇭', n:'Швейцария'}, {f:'🇵🇱', n:'Польша'}, {f:'🇨🇿', n:'Чехия'},
  {f:'🇭🇷', n:'Хорватия'}, {f:'🇷🇸', n:'Сербия'}, {f:'🇷🇺', n:'Россия'}, {f:'🇺🇦', n:'Украина'},
  {f:'🇷🇴', n:'Румыния'}, {f:'🇬🇷', n:'Греция'}, {f:'🇹🇷', n:'Турция'}, {f:'🇸🇪', n:'Швеция'},
  {f:'🇩🇰', n:'Дания'}, {f:'🇳🇴', n:'Норвегия'}, {f:'🇫🇮', n:'Финляндия'}, {f:'🇭🇺', n:'Венгрия'},
  {f:'🇧🇬', n:'Болгария'}, {f:'🇸🇰', n:'Словакия'}, {f:'🇸🇮', n:'Словения'}, {f:'🇦🇱', n:'Албания'},
  {f:'🇲🇰', n:'С. Македония'}, {f:'🇲🇩', n:'Молдова'}, {f:'🇧🇾', n:'Беларусь'}, {f:'🇱🇹', n:'Литва'},
  {f:'🇱🇻', n:'Латвия'}, {f:'🇪🇪', n:'Эстония'}, {f:'🇮🇸', n:'Исландия'}, {f:'🇱🇺', n:'Люксембург'},
  {f:'🇲🇹', n:'Мальта'}, {f:'🇨🇾', n:'Кипр'}, {f:'🇦🇩', n:'Андорра'}, {f:'🇲🇨', n:'Монако'},
  {f:'🇱🇮', n:'Лихтенштейн'}, {f:'🇸🇲', n:'Сан-Марино'}, {f:'🇻🇦', n:'Ватикан'},
  {f:'🇧🇦', n:'Босния и Герцеговина'}, {f:'🇲🇪', n:'Черногория'}, {f:'🇽🇰', n:'Косово'},
  // Америка
  {f:'🇧🇷', n:'Бразилия'}, {f:'🇦🇷', n:'Аргентина'}, {f:'🇺🇾', n:'Уругвай'}, {f:'🇨🇱', n:'Чили'},
  {f:'🇨🇴', n:'Колумбия'}, {f:'🇵🇪', n:'Перу'}, {f:'🇪🇨', n:'Эквадор'}, {f:'🇵🇾', n:'Парагвай'},
  {f:'🇻🇪', n:'Венесуэла'}, {f:'🇧🇴', n:'Боливия'}, {f:'🇲🇽', n:'Мексика'}, {f:'🇺🇸', n:'США'},
  {f:'🇨🇦', n:'Канада'}, {f:'🇨🇷', n:'Коста-Рика'}, {f:'🇵🇦', n:'Панама'}, {f:'🇯🇲', n:'Ямайка'},
  {f:'🇭🇳', n:'Гондурас'}, {f:'🇬🇹', n:'Гватемала'}, {f:'🇨🇺', n:'Куба'}, {f:'🇩🇴', n:'Доминикана'},
  {f:'🇭🇹', n:'Гаити'}, {f:'🇹🇹', n:'Тринидад и Тобаго'}, {f:'🇨🇼', n:'Кюрасао'}, {f:'🇸🇷', n:'Суринам'},
  // Азия
  {f:'🇯🇵', n:'Япония'}, {f:'🇰🇷', n:'Южная Корея'}, {f:'🇨🇳', n:'Китай'}, {f:'🇮🇳', n:'Индия'},
  {f:'🇸🇦', n:'Саудовская Аравия'}, {f:'🇦🇪', n:'ОАЭ'}, {f:'🇶🇦', n:'Катар'}, {f:'🇮🇷', n:'Иран'},
  {f:'🇮🇶', n:'Ирак'}, {f:'🇸🇾', n:'Сирия'}, {f:'🇱🇧', n:'Ливан'}, {f:'🇮🇱', n:'Израиль'},
  {f:'🇹🇭', n:'Таиланд'}, {f:'🇻🇳', n:'Вьетнам'}, {f:'🇮🇩', n:'Индонезия'}, {f:'🇲🇾', n:'Малайзия'},
  {f:'🇵🇭', n:'Филиппины'}, {f:'🇰🇿', n:'Казахстан'}, {f:'🇺🇿', n:'Узбекистан'}, {f:'🇦🇫', n:'Афганистан'},
  {f:'🇵🇰', n:'Пакистан'}, {f:'🇧🇩', n:'Бангладеш'}, {f:'🇱🇰', n:'Шри-Ланка'}, {f:'🇲🇲', n:'Мьянма'},
  {f:'🇰🇬', n:'Кыргызстан'}, {f:'🇹🇯', n:'Таджикистан'}, {f:'🇹🇲', n:'Туркменистан'}, {f:'🇲🇳', n:'Монголия'},
  {f:'🇹🇼', n:'Тайвань'}, {f:'🇭🇰', n:'Гонконг'}, {f:'🇧🇳', n:'Бруней'}, {f:'🇰🇭', n:'Камбоджа'},
  {f:'🇳🇵', n:'Непал'}, {f:'🇱🇦', n:'Лаос'}, {f:'🇹🇱', n:'Восточный Тимор'},
  // Африка
  {f:'🇪🇬', n:'Египет'}, {f:'🇲🇦', n:'Марокко'}, {f:'🇩🇿', n:'Алжир'}, {f:'🇹🇳', n:'Тунис'},
  {f:'🇳🇬', n:'Нигерия'}, {f:'🇨🇲', n:'Камерун'}, {f:'🇬🇭', n:'Гана'}, {f:'🇸🇳', n:'Сенегал'},
  {f:'🇨🇮', n:'Кот-д\'Ивуар'}, {f:'🇿🇦', n:'ЮАР'}, {f:'🇰🇪', n:'Кения'}, {f:'🇪🇹', n:'Эфиопия'},
  {f:'🇱🇾', n:'Ливия'}, {f:'🇸🇩', n:'Судан'}, {f:'🇸🇴', n:'Сомали'}, {f:'🇺🇬', n:'Уганда'},
  {f:'🇹🇿', n:'Танзания'}, {f:'🇲🇿', n:'Мозамбик'}, {f:'🇦🇴', n:'Ангола'}, {f:'🇿🇲', n:'Замбия'},
  {f:'🇿🇼', n:'Зимбабве'}, {f:'🇧🇼', n:'Ботсвана'}, {f:'🇳🇦', n:'Намибия'}, {f:'🇬🇳', n:'Гвинея'},
  {f:'🇧🇫', n:'Буркина-Фасо'}, {f:'🇧🇮', n:'Бурунди'}, {f:'🇨🇬', n:'Конго'}, {f:'🇨🇩', n:'ДР Конго'},
  {f:'🇲🇱', n:'Мали'}, {f:'🇳🇪', n:'Нигер'}, {f:'🇹🇩', n:'Чад'}, {f:'🇷🇼', n:'Руанда'},
  {f:'🇲🇬', n:'Мадагаскар'}, {f:'🇬🇲', n:'Гамбия'}, {f:'🇬🇼', n:'Гвинея-Бисау'}, {f:'🇨🇻', n:'Кабо-Верде'},
  {f:'🇸🇹', n:'Сан-Томе и Принсипи'}, {f:'🇱🇸', n:'Лесото'}, {f:'🇸🇿', n:'Эсватини'}, {f:'🇲🇺', n:'Маврикий'},
  // Океания
  {f:'🇦🇺', n:'Австралия'}, {f:'🇳🇿', n:'Новая Зеландия'}, {f:'🇫🇯', n:'Фиджи'}, {f:'🇵🇬', n:'Папуа-Новая Гвинея'},
  {f:'🇸🇧', n:'Соломоновы Острова'}, {f:'🇻🇺', n:'Вануату'}, {f:'🇼🇸', n:'Самоа'}, {f:'🇹🇴', n:'Тонга'},
  {f:'🇰🇮', n:'Кирибати'}, {f:'🇲🇭', n:'Маршалловы Острова'}, {f:'🇵🇼', n:'Палау'}, {f:'🇹🇻', n:'Тувалу'},
  // Прочее
  {f:'🏴', n:'Чёрный флаг'}, {f:'🏳️', n:'Белый флаг'}, {f:'🏁', n:'Клетчатый'}, {f:'🚩', n:'Красный вымпел'}
];

let flagModalCallback = null;
let currentFlagFilter = '';

function openFlagModal(currentFlag, callback) {
  flagModalCallback = callback;
  currentFlagFilter = '';
  document.getElementById('flag-search').value = '';
  renderFlagsGrid('');
  document.getElementById('flag-modal').classList.add('show');
  setTimeout(() => document.getElementById('flag-search').focus(), 100);
}

function closeFlagModal() {
  document.getElementById('flag-modal').classList.remove('show');
  flagModalCallback = null;
}

function filterFlags(val) {
  currentFlagFilter = val.toLowerCase();
  renderFlagsGrid(currentFlagFilter);
}

function renderFlagsGrid(filter) {
  const grid = document.getElementById('flags-grid');
  const filtered = filter 
    ? FLAGS.filter(f => f.n.toLowerCase().includes(filter) || f.f.includes(filter))
    : FLAGS;
  grid.innerHTML = filtered.map(f => 
    `<button class="flag-btn" title="${escapeHtml(f.n)}" onclick="pickFlag('${f.f}')">${f.f}</button>`
  ).join('');
  if (filtered.length === 0) {
    grid.innerHTML = '<div style="grid-column:1/-1; text-align:center; padding:20px; color:var(--text-muted);">Ничего не найдено</div>';
  }
}

function pickFlag(flag) {
  if (flagModalCallback) flagModalCallback(flag);
  closeFlagModal();
}

function selectFlag(flag) {
  if (flagModalCallback) flagModalCallback(flag);
  closeFlagModal();
}

// ============ ПРЕСЕТЫ ТУРНИРОВ ============
const TOURNAMENT_PRESETS = [
  { emoji: '🇪🇸', name: 'Ла Лига', rounds: 38, international: false, hasPlayoff: false, format: 'single', customFormat: {'1/8':2,'1/4':2,'1/2':2,'Final':1}, ptsWin: 3, ptsDraw: 1 },
  { emoji: '🏴󠁧󠁢󠁥󠁧󠁿', name: 'АПЛ', rounds: 38, international: false, hasPlayoff: false, format: 'single', customFormat: {'1/8':2,'1/4':2,'1/2':2,'Final':1}, ptsWin: 3, ptsDraw: 1 },
  { emoji: '🇮🇹', name: 'Серия А', rounds: 38, international: false, hasPlayoff: false, format: 'single', customFormat: {'1/8':2,'1/4':2,'1/2':2,'Final':1}, ptsWin: 3, ptsDraw: 1 },
  { emoji: '🇩🇪', name: 'Бундеслига', rounds: 34, international: false, hasPlayoff: false, format: 'single', customFormat: {'1/8':2,'1/4':2,'1/2':2,'Final':1}, ptsWin: 3, ptsDraw: 1 },
  { emoji: '🇫🇷', name: 'Лига 1', rounds: 34, international: false, hasPlayoff: false, format: 'single', customFormat: {'1/8':2,'1/4':2,'1/2':2,'Final':1}, ptsWin: 3, ptsDraw: 1 },
  { emoji: '🇷🇺', name: 'РПЛ', rounds: 30, international: false, hasPlayoff: false, format: 'single', customFormat: {'1/8':2,'1/4':2,'1/2':2,'Final':1}, ptsWin: 3, ptsDraw: 1 },
  { emoji: '🇵🇹', name: 'Примейра', rounds: 34, international: false, hasPlayoff: false, format: 'single', customFormat: {'1/8':2,'1/4':2,'1/2':2,'Final':1}, ptsWin: 3, ptsDraw: 1 },
  { emoji: '🇳🇱', name: 'Эредивизие', rounds: 34, international: false, hasPlayoff: false, format: 'single', customFormat: {'1/8':2,'1/4':2,'1/2':2,'Final':1}, ptsWin: 3, ptsDraw: 1 },
  { emoji: '🇧🇷', name: 'Серия А (Бразилия)', rounds: 38, international: false, hasPlayoff: false, format: 'single', customFormat: {'1/8':2,'1/4':2,'1/2':2,'Final':1}, ptsWin: 3, ptsDraw: 1 },
  { emoji: '🏆', name: 'Лига Чемпионов', rounds: 6, international: true, hasPlayoff: true, format: 'double', customFormat: {'1/8':2,'1/4':2,'1/2':2,'Final':1}, ptsWin: 3, ptsDraw: 1 },
  { emoji: '🏆', name: 'Лига Европы', rounds: 6, international: true, hasPlayoff: true, format: 'double', customFormat: {'1/8':2,'1/4':2,'1/2':2,'Final':1}, ptsWin: 3, ptsDraw: 1 },
  { emoji: '🏆', name: 'Лига Конференций', rounds: 6, international: true, hasPlayoff: true, format: 'double', customFormat: {'1/8':2,'1/4':2,'1/2':2,'Final':1}, ptsWin: 3, ptsDraw: 1 },
  { emoji: '🌍', name: 'Чемпионат Мира', rounds: 3, international: true, hasPlayoff: true, format: 'single', customFormat: {'1/8':1,'1/4':1,'1/2':1,'Final':1}, ptsWin: 3, ptsDraw: 1 },
  { emoji: '🌍', name: 'Клубный ЧМ', rounds: 3, international: true, hasPlayoff: true, format: 'single', customFormat: {'1/8':1,'1/4':1,'1/2':1,'Final':1}, ptsWin: 3, ptsDraw: 1 },
  { emoji: '🇪🇺', name: 'Чемпионат Европы', rounds: 3, international: true, hasPlayoff: true, format: 'single', customFormat: {'1/8':1,'1/4':1,'1/2':1,'Final':1}, ptsWin: 3, ptsDraw: 1 },
  { emoji: '🌎', name: 'Копа Америка', rounds: 3, international: true, hasPlayoff: true, format: 'single', customFormat: {'1/8':1,'1/4':1,'1/2':1,'Final':1}, ptsWin: 3, ptsDraw: 1 },
  { emoji: '🏆', name: 'Кубок (страна)', rounds: 3, international: false, hasPlayoff: true, format: 'single', customFormat: {'1/8':1,'1/4':1,'1/2':1,'Final':1}, ptsWin: 3, ptsDraw: 1 },
  { emoji: '🏆', name: 'Суперкубок', rounds: 1, international: false, hasPlayoff: false, format: 'single', customFormat: {'1/8':1,'1/4':1,'1/2':1,'Final':1}, ptsWin: 3, ptsDraw: 1 },
  { emoji: '🌍', name: 'Квалификация ЧМ', rounds: 10, international: true, hasPlayoff: false, format: 'single', customFormat: {'1/8':2,'1/4':2,'1/2':2,'Final':1}, ptsWin: 3, ptsDraw: 1 },
  { emoji: '🇪🇺', name: 'Квалификация ЧЕ', rounds: 10, international: true, hasPlayoff: false, format: 'single', customFormat: {'1/8':2,'1/4':2,'1/2':2,'Final':1}, ptsWin: 3, ptsDraw: 1 }
];

function openPresetsModal() {
  const grid = document.getElementById('presets-grid');
  grid.innerHTML = TOURNAMENT_PRESETS.map((p, idx) => `
    <div class="preset-card" onclick="applyPreset(${idx})">
      <div class="preset-name">${p.emoji} ${escapeHtml(p.name)}</div>
      <div class="preset-meta">${p.rounds} матчей · ${p.hasPlayoff ? 'плей-офф' : 'лига'}${p.international ? ' · 🌍' : ''}</div>
    </div>
  `).join('');
  document.getElementById('presets-modal').classList.add('show');
}

function closePresetsModal() {
  document.getElementById('presets-modal').classList.remove('show');
}

function applyPreset(idx) {
  const p = TOURNAMENT_PRESETS[idx];
  const key = 'custom_' + Date.now() + '_' + Math.random().toString(36).slice(2,6);
  tournaments[key] = emptyTournament(p.emoji, p.name, p.rounds, p.hasPlayoff, p.format);
  tournaments[key].customFormat = {...p.customFormat};
  tournaments[key].pointsPerWin = p.ptsWin;
  tournaments[key].pointsPerDraw = p.ptsDraw;
  tournaments[key].isInternational = p.international;
  tournamentOrder.push(key);
  closePresetsModal();
  renderTabs();
  renderPanels();
  renderTopStats(key);
  renderTeams(key);
  switchTab(key);
  debouncedSave();
  showToast(`Добавлен турнир «${p.name}»`);
}

// ============ STATE ============
let tournamentOrder = [];
let globalTeams = [];
const tournaments = {};

let seasons = [];
let currentSeasonIdx = 0;
let saveTimer = null;

const COLORS = {
  blue: '#3b82f6', green: '#10b981', amber: '#f59e0b',
  red: '#ef4444', purple: '#8b5cf6', pink: '#ec4899',
  teal: '#14b8a6', orange: '#f97316', slate: '#64748b',
  myTeam: '#f59e0b'
};

const TOURNAMENT_COLORS = ['#ef4444', '#f97316', '#3b82f6', '#10b981', '#8b5cf6', '#ec4899'];

const TOURNAMENT_CONFIG_KEYS = ['emoji', 'name', 'rounds', 'displayLimit', 'pointsPerWin', 'pointsPerDraw', 'showH2H', 'hasPlayoff', 'playoffFormat', 'isInternational', 'customFormat'];

function emptyTournament(emoji, name, rounds, hasPlayoff = false, playoffFormat = 'single') {
  return {
    emoji, name, rounds, displayLimit: 0,
    pointsPerWin: 3, pointsPerDraw: 1, showH2H: true,
    hasPlayoff, playoffFormat, isInternational: false,
    customFormat: { '1/8': 2, '1/4': 2, '1/2': 2, 'Final': 1 },
    teams: [], topScorer: null, topAssist: null,
    reachedPlayoff: false, playoffMatches: [],
    groupCollapsed: undefined, playoffCollapsed: undefined,
    summary: { goals: 0, assists: 0, mvp: 0, accuracy: 0, rating: 0 }
  };
}

function syncTournamentConfig(srcKey, config) {
  seasons.forEach((s, idx) => {
    if (idx === currentSeasonIdx) return;
    if (s.tournaments[srcKey]) {
      TOURNAMENT_CONFIG_KEYS.forEach(k => { s.tournaments[srcKey][k] = JSON.parse(JSON.stringify(config[k])); });
    }
  });
}

function syncTournamentOrder() {
}

function initDefaults() {
  tournamentOrder = [];
  globalTeams = [];
}

function getTeamById(teamId) {
  if (!teamId) return null;
  return globalTeams.find(t => t.id === teamId);
}

function getSortedTeams(tournamentKey) {
  const t = tournamentKey ? tournaments[tournamentKey] : null;
  const isInternational = t ? t.isInternational : false;
  const tournamentEmoji = t ? t.emoji : '';

  const teamsInAnyTournament = new Set();
  tournamentOrder.forEach(k => {
    (tournaments[k].teams || []).forEach(te => teamsInAnyTournament.add(te.teamId));
  });

  const countryCountInTournament = {};
  if (t) {
    t.teams.forEach(te => {
      const gt = getTeamById(te.teamId);
      if (gt && gt.flag) countryCountInTournament[gt.flag] = (countryCountInTournament[gt.flag] || 0) + 1;
    });
  }

  const countryTotalCount = {};
  tournamentOrder.forEach(k => {
    (tournaments[k].teams || []).forEach(te => {
      const gt = getTeamById(te.teamId);
      if (gt && gt.flag) countryTotalCount[gt.flag] = (countryTotalCount[gt.flag] || 0) + 1;
    });
  });

  return [...globalTeams].filter(t => t.visible !== false).sort((a, b) => {
    if (a.isMe && !b.isMe) return -1;
    if (!a.isMe && b.isMe) return 1;

    if (!isInternational && tournamentEmoji) {
      const aMatch = a.flag === tournamentEmoji;
      const bMatch = b.flag === tournamentEmoji;
      if (aMatch && !bMatch) return -1;
      if (!aMatch && bMatch) return 1;
    }

    const aNew = !teamsInAnyTournament.has(a.id);
    const bNew = !teamsInAnyTournament.has(b.id);
    if (aNew && !bNew) return -1;
    if (!aNew && bNew) return 1;

    if (isInternational) {
      const aInThis = countryCountInTournament[a.flag] || 0;
      const bInThis = countryCountInTournament[b.flag] || 0;
      const aTotal = countryTotalCount[a.flag] || 0;
      const bTotal = countryTotalCount[b.flag] || 0;

      if (aInThis === 0 && bInThis > 0) return -1;
      if (aInThis > 0 && bInThis === 0) return 1;

      if (aTotal !== bTotal) return bTotal - aTotal;

      return a.name.localeCompare(b.name, 'ru');
    }

    return a.name.localeCompare(b.name, 'ru');
  });
}

function getMyTeamInTournament(key) {
  const t = tournaments[key];
  if (!t) return null;
  for (const entry of t.teams) {
    const gt = getTeamById(entry.teamId);
    if (gt && gt.isMe) return { entry, globalTeam: gt };
  }
  return null;
}

function calcPoints(key, w, d) {
  const t = tournaments[key];
  if (!t) return 0;
  return w * (t.pointsPerWin || 3) + d * (t.pointsPerDraw || 1);
}

function calcAutoRating(key) {
  const t = tournaments[key];
  const my = getMyTeamInTournament(key);
  if (!my) return 0;
  const s = t.summary || {};
  const total = my.entry.w + my.entry.d + my.entry.l;
  if (total === 0) return 0;
  let rating = 5.0;
  rating += (s.goals || 0) * 0.15;
  rating += (s.assists || 0) * 0.1;
  rating += (s.mvp || 0) * 0.3;
  rating += (my.entry.w / total) * 2.0;
  const achievement = getAchievement(key);
  if (achievement === 'Чемпионство') rating += 0.5;
  return Math.round(Math.min(10, Math.max(1, rating)) * 10) / 10;
}

function getNextRound(key) {
  const t = tournaments[key];
  if (t.playoffMatches.length === 0) return '1/8';
  const lastMatch = t.playoffMatches[t.playoffMatches.length - 1];
  const expectedMatches = t.customFormat[lastMatch.round] || 1;
  const matchesInRound = t.playoffMatches.filter(m => m.round === lastMatch.round);
  if (matchesInRound.length >= expectedMatches) {
    const roundOrder = ['1/8', '1/4', '1/2', 'Final'];
    const idx = roundOrder.indexOf(lastMatch.round);
    if (idx === -1 || idx === roundOrder.length - 1) return 'Final';
    return roundOrder[idx + 1];
  }
  return lastMatch.round;
}

function isTournamentFinished(key) {
  const t = tournaments[key];
  const my = getMyTeamInTournament(key);
  if (!my) return false;
  const groupMatches = my.entry.w + my.entry.d + my.entry.l;
  if (!t.hasPlayoff) return groupMatches >= t.rounds;
  if (!t.reachedPlayoff) return groupMatches >= t.rounds;
  if (t.playoffMatches.length === 0) return false;
  const lastMatch = t.playoffMatches[t.playoffMatches.length - 1];
  if (lastMatch.result !== 'win' && lastMatch.result !== 'loss') return false;
  return lastMatch.round === 'Final' || lastMatch.result === 'loss';
}

function getAchievement(key) {
  const t = tournaments[key];
  const my = getMyTeamInTournament(key);
  if (!my) return '';
  const meIdx = t.teams.indexOf(my.entry);
  if (!t.hasPlayoff) {
    const rank = meIdx + 1;
    return rank === 1 ? 'Чемпионство' : `${rank} место`;
  }
  if (!t.reachedPlayoff) {
    const rank = meIdx + 1;
    return `${rank} место в группе`;
  }
  if (t.playoffMatches.length === 0) return '';
  const lastMatch = t.playoffMatches[t.playoffMatches.length - 1];
  if (lastMatch.round === 'Final' && lastMatch.result === 'win') return 'Чемпионство';
  if (lastMatch.round === 'Final' && lastMatch.result === 'loss') return '2 место';
  if (lastMatch.round === 'Final' && lastMatch.result === 'draw') return 'Финал (ничья)';
  if (lastMatch.result === 'loss') {
    const roundRanges = { '1/2': '3-4', '1/4': '5-8', '1/8': '9-16' };
    const range = roundRanges[lastMatch.round];
    if (range) return `${range} место`;
  }
  return '';
}

function getTotalMatches(key) {
  const t = tournaments[key];
  const my = getMyTeamInTournament(key);
  if (!my) return 0;
  const groupMatches = my.entry.w + my.entry.d + my.entry.l;
  const playoffMatches = t.playoffMatches.filter(m => m.result === 'win' || m.result === 'loss' || m.result === 'draw').length;
  return groupMatches + playoffMatches;
}

function getTotalPossibleMatches(key) {
  const t = tournaments[key];
  if (!t.hasPlayoff) return t.rounds;
  let playoffTotal = 0;
  Object.values(t.customFormat).forEach(v => playoffTotal += v);
  return t.rounds + playoffTotal;
}

// ============ FOCUS PRESERVATION ============
function saveFocusState() {
  const active = document.activeElement;
  if (!active || active === document.body) return null;
  const tagName = active.tagName;
  if (tagName !== 'INPUT' && tagName !== 'TEXTAREA' && tagName !== 'SELECT') return null;
  return {
    focusId: active.dataset.focusId,
    selStart: typeof active.selectionStart === 'number' ? active.selectionStart : null,
    selEnd: typeof active.selectionEnd === 'number' ? active.selectionEnd : null
  };
}

function restoreFocus(state, container) {
  if (!state || !state.focusId || !container) return;
  const el = container.querySelector(`[data-focus-id="${state.focusId}"]`);
  if (!el) return;
  el.focus();
  if (state.selStart !== null && typeof el.setSelectionRange === 'function' && (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA')) {
    try { 
      if (el.type === 'text' && el.inputMode === 'numeric') {
        el.setSelectionRange(el.value.length, el.value.length);
      } else {
        el.setSelectionRange(state.selStart, state.selEnd);
      }
    } catch(e) {}
  }
}

// ============ LOCAL STORAGE ============
function buildCurrentSeasonData() {
  return {
    tournamentOrder: [...tournamentOrder],
    tournaments: JSON.parse(JSON.stringify(tournaments)),
    globalTeams: JSON.parse(JSON.stringify(globalTeams))
  };
}

function syncCurrentSeason() {
  if (currentSeasonIdx < 0 || currentSeasonIdx >= seasons.length) return;
  const data = buildCurrentSeasonData();
  seasons[currentSeasonIdx].tournamentOrder = data.tournamentOrder;
  seasons[currentSeasonIdx].tournaments = data.tournaments;
  seasons[currentSeasonIdx].globalTeams = data.globalTeams;
}

function saveToLocalStorage() {
  try {
    syncCurrentSeason();
    const data = {
      version: 4,
      seasons: JSON.parse(JSON.stringify(seasons)),
      currentSeasonIdx
    };
    localStorage.setItem('tournamentApp_v4', JSON.stringify(data));
    saveToCookies();
  } catch (e) { console.warn('Save failed', e); }
}

function debouncedSave() {
  if (saveTimer) clearTimeout(saveTimer);
  saveTimer = setTimeout(saveToLocalStorage, 800);
}

function migrateFlags(data) {
  if (!data || !data.seasons) return data;
  const teamFlagByName = {
    'Real Betiz': '🇪🇸', 'Bacelona': '🇪🇸', 'R-Madrid': '🇪🇸',
    'Atlet Madrid': '🇪🇸', 'Vilarreal': '🇪🇸', 'Sevila': '🇪🇸',
    'RB Leipzi': '🇩🇪', 'Veronaa': '🇮🇹', 'FK Soch': '🇷🇺',
    'WestHan': '🇬🇧', 'Roma': '🇮🇹', 'Arsnal': '🇬🇧',
    'Monacco': '🇲🇨', 'Allmeria': '🇪🇸', 'Vallencia': '🇪🇸',
    'Ibiz Evissa': '🇪🇸', 'Athlet Billbao': '🇪🇸', 'Real Socied': '🇪🇸',
    'RUS': '🇷🇺', 'CRO': '🇭🇷', 'POL': '🇵🇱', 'SCO': '🇬🇧',
    'CZE': '🇨🇿', 'ROM': '🇷🇴'
  };
  const isFlagBroken = (f) => f && f.length <= 2 && f !== '' && !f.startsWith('🏴');
  data.seasons.forEach(s => {
    (s.globalTeams || []).forEach(t => {
      if (t.visible === undefined) t.visible = true;
      if (!t.flag || t.flag === '') return;
      if (teamFlagByName[t.name]) {
        t.flag = teamFlagByName[t.name];
      } else if (isFlagBroken(t.flag)) {
        t.flag = '🏳️';
      }
    });
    Object.values(s.tournaments || {}).forEach(t => {
      if (t.emoji && isFlagBroken(t.emoji)) {
        const nameLower = (t.name || '').toLowerCase();
        if (nameLower.includes('serie') || nameLower.includes('серия')) t.emoji = '🇮🇹';
        else if (nameLower.includes('рпл') || nameLower.includes('rpl')) t.emoji = '🇷🇺';
        else if (nameLower.includes('лига чемпионов')) t.emoji = '🏆';
        else if (nameLower.includes('лига европы')) t.emoji = '🏆';
        else if (nameLower.includes('европ')) t.emoji = '🇪🇺';
        else if (nameLower.includes('кубок')) t.emoji = '🏆';
        else t.emoji = '🏆';
      }
    });
  });
  return data;
}

function loadFromLocalStorage() {
  try {
    for (const vKey of ['tournamentApp_v3', 'tournamentApp_v2']) {
      const raw = localStorage.getItem(vKey);
      if (raw) {
        const data = JSON.parse(raw);
        data.version = 4;
        if (data.seasons) {
          data.seasons.forEach(s => {
            (s.globalTeams || []).forEach(t => { if (!t.flag) t.flag = ''; });
            Object.values(s.tournaments || {}).forEach(t => { if (t.isInternational === undefined) t.isInternational = false; });
          });
        }
        localStorage.setItem('tournamentApp_v4', JSON.stringify(data));
        localStorage.removeItem(vKey);
        break;
      }
    }
    
    let raw = localStorage.getItem('tournamentApp_v4');
    if (!raw) {
      const cookieData = loadFromCookies();
      if (cookieData && cookieData.seasons && cookieData.seasons.length > 0) {
        raw = JSON.stringify(cookieData);
        localStorage.setItem('tournamentApp_v4', raw);
      }
    }
    if (!raw) return false;
    let data = JSON.parse(raw);
    data = migrateFlags(data);
    try { localStorage.setItem('tournamentApp_v4', JSON.stringify(data)); } catch(e) {}
    if (!data.seasons || data.seasons.length === 0) return false;
    seasons = data.seasons;
    currentSeasonIdx = data.currentSeasonIdx ?? 0;
    if (currentSeasonIdx < 0 || currentSeasonIdx >= seasons.length) currentSeasonIdx = 0;
    const s = seasons[currentSeasonIdx];
    tournamentOrder = [...(s.tournamentOrder || [])];
    Object.keys(tournaments).forEach(k => delete tournaments[k]);
    for (const [k, v] of Object.entries(s.tournaments || {})) {
      tournaments[k] = JSON.parse(JSON.stringify(v));
    }
    globalTeams = JSON.parse(JSON.stringify(s.globalTeams || []));
    return true;
  } catch (e) {
    console.warn('Load failed', e);
    return false;
  }
}

// ============ SEASONS ============
function updateSeasonSelector() {
  const selector = document.getElementById('season-selector');
  if (!selector) return;
  selector.innerHTML = seasons.map((s, idx) => 
    `<option value="${idx}" ${idx === currentSeasonIdx ? 'selected' : ''}>Сезон ${s.year}</option>`
  ).join('');
}

function onSeasonChange(val) {
  const idx = parseInt(val);
  if (isNaN(idx) || idx === currentSeasonIdx) return;
  switchSeason(idx);
}

function switchSeason(idx) {
  if (idx < 0 || idx >= seasons.length) return;
  syncCurrentSeason();
  currentSeasonIdx = idx;
  const s = seasons[idx];
  Object.keys(tournaments).forEach(k => delete tournaments[k]);
  tournamentOrder = [...(s.tournamentOrder || [])];
  for (const [k, v] of Object.entries(s.tournaments || {})) {
    tournaments[k] = JSON.parse(JSON.stringify(v));
  }
  globalTeams = JSON.parse(JSON.stringify(s.globalTeams || []));
  fullRender();
  saveToLocalStorage();
  showToast(`Переключено на сезон ${s.year}`);
}

function openNewSeasonModal() {
  const defaultYear = seasons.length > 0 ? (seasons[seasons.length - 1].year + 1) : 2025;
  document.getElementById('new-season-year').value = defaultYear;
  document.getElementById('new-season-modal').classList.add('show');
  setTimeout(() => document.getElementById('new-season-year').focus(), 100);
}

function closeNewSeasonModal() {
  document.getElementById('new-season-modal').classList.remove('show');
}

function createNewSeason() {
  const yearStr = document.getElementById('new-season-year').value.trim();
  if (!yearStr) { showToast('Введи год'); return; }
  const year = parseInt(yearStr);
  if (isNaN(year) || year < 1900 || year > 2100) { showToast('Год должен быть от 1900 до 2100'); return; }
  
  syncCurrentSeason();
  const copiedTeams = JSON.parse(JSON.stringify(globalTeams)).map(t => ({ ...t, visible: false, isMe: false }));
  const newTournaments = {};
  tournamentOrder.forEach(key => {
    const src = tournaments[key];
    newTournaments[key] = emptyTournament(src.emoji, src.name, src.rounds, src.hasPlayoff, src.playoffFormat);
    TOURNAMENT_CONFIG_KEYS.forEach(k => { newTournaments[key][k] = JSON.parse(JSON.stringify(src[k])); });
  });
  const newSeason = { 
    year, 
    tournamentOrder: [...tournamentOrder], 
    tournaments: newTournaments, 
    globalTeams: copiedTeams
  };
  seasons.push(newSeason);
  currentSeasonIdx = seasons.length - 1;
  Object.keys(tournaments).forEach(k => delete tournaments[k]);
  tournamentOrder = [...newSeason.tournamentOrder];
  for (const [k, v] of Object.entries(newSeason.tournaments)) {
    tournaments[k] = JSON.parse(JSON.stringify(v));
  }
  globalTeams = JSON.parse(JSON.stringify(newSeason.globalTeams));
  
  closeNewSeasonModal();
  fullRender();
  saveToLocalStorage();
  switchTab('settings');
  showToast(`✅ Создан сезон ${year}`);
}

function duplicateCurrentSeason() {
  syncCurrentSeason();
  const s = seasons[currentSeasonIdx];
  const newYear = prompt(`Год для копии сезона ${s.year}:`, s.year + 1);
  if (!newYear) return;
  const y = parseInt(newYear);
  if (isNaN(y)) { showToast('Неверный год'); return; }
  const copy = {
    year: y,
    tournamentOrder: JSON.parse(JSON.stringify(s.tournamentOrder)),
    tournaments: JSON.parse(JSON.stringify(s.tournaments)),
    globalTeams: JSON.parse(JSON.stringify(s.globalTeams))
  };
  Object.values(copy.tournaments).forEach(t => {
    t.teams.forEach(tm => { tm.w = 0; tm.d = 0; tm.l = 0; tm.h2h = [0,0,0]; });
    t.playoffMatches = [];
    t.reachedPlayoff = false;
    t.groupCollapsed = undefined;
    t.playoffCollapsed = undefined;
    t.topScorer = null;
    t.topAssist = null;
    t.summary = { goals: 0, assists: 0, mvp: 0, accuracy: 0, rating: 0 };
  });
  seasons.push(copy);
  switchSeason(seasons.length - 1);
  showToast(`Дубликат сезона ${y} создан`);
}

function deleteSeason(idx) {
  if (seasons.length <= 1) { showToast('Нельзя удалить единственный сезон'); return; }
  if (!confirm(`Удалить сезон ${seasons[idx].year}?`)) return;
  seasons.splice(idx, 1);
  if (currentSeasonIdx >= seasons.length) currentSeasonIdx = seasons.length - 1;
  else if (currentSeasonIdx > idx) currentSeasonIdx--;
  else if (currentSeasonIdx === idx) {
    const s = seasons[currentSeasonIdx];
    Object.keys(tournaments).forEach(k => delete tournaments[k]);
    tournamentOrder = [...(s.tournamentOrder || [])];
    for (const [k, v] of Object.entries(s.tournaments || {})) {
      tournaments[k] = JSON.parse(JSON.stringify(v));
    }
    globalTeams = JSON.parse(JSON.stringify(s.globalTeams || []));
  }
  fullRender();
  saveToLocalStorage();
  showToast('Сезон удалён');
}

function renameSeason(idx) {
  const newYear = prompt('Новый год сезона:', seasons[idx].year);
  if (!newYear) return;
  const y = parseInt(newYear);
  if (isNaN(y)) { showToast('Неверный год'); return; }
  seasons[idx].year = y;
  updateSeasonSelector();
  renderSeasonsList();
  saveToLocalStorage();
}

function renderSeasonsList() {
  const container = document.getElementById('seasons-list');
  if (!container) return;
  container.innerHTML = '';
  const sorted = seasons.map((s, idx) => ({ s, idx })).sort((a, b) => Number(b.s.year) - Number(a.s.year));
  sorted.forEach(({ s, idx }) => {
    const isCurrent = idx === currentSeasonIdx;
    const tCount = (s.tournamentOrder || []).length;
    const teamCount = (s.globalTeams || []).filter(t => t.visible !== false && t.visible !== 0).length;
    const item = document.createElement('div');
    item.className = 'season-list-item' + (isCurrent ? ' current' : '');
    item.innerHTML = `
      <span style="font-size:18px;">📅</span>
      <div style="flex:1; min-width:150px;">
        <div class="name">${escapeHtml(String(s.year))} ${isCurrent ? '<span class="my-team-badge">текущий</span>' : ''}</div>
        <div class="meta">${tCount} турниров · ${teamCount} команд</div>
      </div>
      ${!isCurrent ? `<button class="btn btn-sm" onclick="switchSeason(${idx})">Открыть</button>` : ''}
      <button class="btn btn-sm" onclick="renameSeason(${idx})">✏️</button>
      <button class="btn btn-danger btn-sm" onclick="deleteSeason(${idx})">✕</button>
    `;
    container.appendChild(item);
  });
}
