// ============ CHARTS ============
const chartInstances = {};
let currentFormTournament = null;

function getChartColors() {
  const bg = getComputedStyle(document.body).backgroundColor;
  const match = bg.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
  const luminance = match ? (0.299 * +match[1] + 0.587 * +match[2] + 0.114 * +match[3]) / 255 : 0.95;
  const dark = luminance < 0.4;
  return {
    text: dark ? '#e5e5e5' : '#1a1a1a',
    textMuted: dark ? '#a0a0a0' : '#737373',
    grid: dark ? 'rgba(255,255,255,0.08)' : '#f0f0f0',
    tooltipBg: dark ? '#333' : '#1a1a1a',
    emptyBar: dark ? '#444' : '#e5e5e5'
  };
}

function chartOpts(overrides = {}) {
  const c = getChartColors();
  const base = {
    responsive: true, maintainAspectRatio: false,
    plugins: {
      legend: { labels: { font: { family: '-apple-system, BlinkMacSystemFont, sans-serif', size: 12 }, color: c.text, boxWidth: 12, boxHeight: 12, useBorderRadius: true, borderRadius: 2, padding: 12 } },
      tooltip: { backgroundColor: c.tooltipBg, titleColor: '#fff', bodyColor: '#fff', padding: 10, cornerRadius: 4, titleFont: { weight: '600' }, displayColors: false }
    },
    scales: {
      x: { grid: { display: false }, ticks: { color: c.text, font: { size: 11 } }, border: { display: false } },
      y: { grid: { color: c.grid, drawBorder: false }, ticks: { color: c.textMuted, font: { size: 11 } }, border: { display: false }, beginAtZero: true }
    }
  };
  return JSON.parse(JSON.stringify({ ...base, ...overrides }));
}

function destroyChart(id) {
  if (chartInstances[id]) { chartInstances[id].destroy(); delete chartInstances[id]; }
}

function getTournamentColor(key) {
  const idx = tournamentOrder.indexOf(key);
  return TOURNAMENT_COLORS[idx % TOURNAMENT_COLORS.length];
}

function renderSummaryStats() {
  const container = document.getElementById('stats-summary');
  const totalTeams = tournamentOrder.reduce((s, k) => s + (tournaments[k]?.teams.length || 0), 0);
  let myTotalPts = 0, myBestRank = null, myWorstRank = null, myTournamentsCount = 0;
  let totalGoals = 0, totalAssists = 0, totalMvp = 0, totalMatches = 0, trophies = 0;
  let ratingSum = 0, ratingCount = 0;
  tournamentOrder.forEach(k => {
    const t = tournaments[k];
    const my = getMyTeamInTournament(k);
    if (my) {
      myTournamentsCount++;
      myTotalPts += calcPoints(k, my.entry.w, my.entry.d);
      const rank = t.teams.indexOf(my.entry) + 1;
      if (myBestRank === null || rank < myBestRank) myBestRank = rank;
      if (myWorstRank === null || rank > myWorstRank) myWorstRank = rank;
    }
    totalGoals += t.summary.goals;
    totalAssists += t.summary.assists;
    totalMvp += t.summary.mvp;
    totalMatches += getTotalMatches(k);
    if (getAchievement(k) === 'Чемпионство') trophies++;
    if (t.summary.rating > 0) { ratingSum += t.summary.rating; ratingCount++; }
  });
  const avgRating = ratingCount > 0 ? (ratingSum / ratingCount).toFixed(1) : '—';
  const seasonYear = seasons[currentSeasonIdx]?.year || '—';
  container.innerHTML = `
    <div class="stat-box"><div class="label">Сезон</div><div class="value">${seasonYear}</div><div class="sub">${seasons.length} всего</div></div>
    <div class="stat-box highlight"><div class="label">🏆 Трофеи</div><div class="value">${trophies}</div><div class="sub">${myTournamentsCount} турниров</div></div>
    <div class="stat-box"><div class="label">Матчей</div><div class="value">${totalMatches}</div><div class="sub">${totalTeams} команд</div></div>
    <div class="stat-box"><div class="label">⚽ Голы</div><div class="value">${totalGoals}</div><div class="sub">${totalAssists} ассистов</div></div>
    <div class="stat-box"><div class="label">Лучшая позиция</div><div class="value">${myBestRank ?? '—'}</div><div class="sub">худшая: ${myWorstRank ?? '—'}</div></div>
    <div class="stat-box"><div class="label">⭐ Рейтинг</div><div class="value">${avgRating}</div><div class="sub">${totalMvp} МВП</div></div>
  `;
}

function renderPointsChart() {
  destroyChart('chart-points');
  const ctx = document.getElementById('chart-points').getContext('2d');
  const c = getChartColors();
  const sorted = [];
  tournamentOrder.forEach(key => {
    const t = tournaments[key];
    if (!t || t.teams.length === 0) return;
    const color = getTournamentColor(key);
    t.teams.forEach(teamEntry => {
      const globalTeam = getTeamById(teamEntry.teamId);
      if (!globalTeam) return;
      sorted.push({ l: `${globalTeam.name} · ${t.name}`, v: calcPoints(key, teamEntry.w, teamEntry.d), c: globalTeam.isMe ? COLORS.myTeam : color });
    });
  });
  sorted.sort((a, b) => b.v - a.v);
  if (sorted.length === 0) {
    chartInstances['chart-points'] = new Chart(ctx, { type: 'bar', data: { labels: ['Нет данных'], datasets: [{ data: [0], backgroundColor: c.emptyBar }] }, options: chartOpts({ plugins: { legend: { display: false } } }) });
    return;
  }
  chartInstances['chart-points'] = new Chart(ctx, {
    type: 'bar',
    data: { labels: sorted.map(s => s.l), datasets: [{ data: sorted.map(s => s.v), backgroundColor: sorted.map(s => s.c), borderRadius: 4, borderSkipped: false, barThickness: 18 }] },
    options: chartOpts({ indexAxis: 'y', plugins: { legend: { display: false } }, scales: { x: { grid: { color: c.grid, drawBorder: false }, ticks: { color: c.textMuted, font: { size: 11 } }, border: { display: false } }, y: { grid: { display: false }, ticks: { color: c.text, font: { size: 11 } }, border: { display: false } } } })
  });
}

function renderFormSelector() {
  const container = document.getElementById('form-selector');
  container.innerHTML = '';
  const available = tournamentOrder.filter(k => tournaments[k]?.teams.length > 0);
  if (!currentFormTournament || !tournaments[currentFormTournament] || tournaments[currentFormTournament].teams.length === 0) {
    currentFormTournament = available[0] || null;
  }
  available.forEach(key => {
    const t = tournaments[key];
    const btn = document.createElement('button');
    btn.textContent = `${t.emoji} ${t.name}`;
    btn.className = key === currentFormTournament ? 'active' : '';
    btn.onclick = () => {
      currentFormTournament = key;
      document.querySelectorAll('#form-selector button').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      renderFormChart();
    };
    container.appendChild(btn);
  });
}

function renderFormChart() {
  destroyChart('chart-form');
  const ctx = document.getElementById('chart-form').getContext('2d');
  const c = getChartColors();
  const t = tournaments[currentFormTournament];
  if (!t || t.teams.length === 0) return;
  const labels = t.teams.map(tm => { const gt = getTeamById(tm.teamId); return gt ? gt.name : '???'; });
  chartInstances['chart-form'] = new Chart(ctx, {
    type: 'bar',
    data: { labels, datasets: [
      { label: 'Победы', data: t.teams.map(tm => tm.w), backgroundColor: COLORS.green, borderRadius: 4, borderSkipped: false },
      { label: 'Ничьи', data: t.teams.map(tm => tm.d), backgroundColor: COLORS.amber, borderRadius: 4, borderSkipped: false },
      { label: 'Поражения', data: t.teams.map(tm => tm.l), backgroundColor: COLORS.red, borderRadius: 4, borderSkipped: false }
    ] },
    options: chartOpts({ plugins: { legend: { display: true, position: 'top', labels: { color: c.text, boxWidth: 12, boxHeight: 12, useBorderRadius: true, borderRadius: 2, padding: 12 } } }, scales: { x: { stacked: true, grid: { display: false }, ticks: { color: c.text, font: { size: 11 } }, border: { display: false } }, y: { stacked: true, grid: { color: c.grid, drawBorder: false }, ticks: { color: c.textMuted, font: { size: 11 }, stepSize: 1 }, border: { display: false }, beginAtZero: true } } })
  });
}

function renderTopsChart() {
  destroyChart('chart-tops');
  const ctx = document.getElementById('chart-tops').getContext('2d');
  const c = getChartColors();
  const labels = [], scorerData = [], assistData = [];
  tournamentOrder.forEach(key => {
    const t = tournaments[key];
    if (!t || (t.topScorer == null && t.topAssist == null)) return;
    labels.push(t.name);
    scorerData.push(t.topScorer);
    assistData.push(t.topAssist);
  });
  if (labels.length === 0) {
    chartInstances['chart-tops'] = new Chart(ctx, { type: 'bar', data: { labels: ['Нет данных'], datasets: [{ data: [0], backgroundColor: c.emptyBar }] }, options: chartOpts({ plugins: { legend: { display: false } } }) });
    return;
  }
  chartInstances['chart-tops'] = new Chart(ctx, {
    type: 'bar',
    data: { labels, datasets: [
      { label: 'Бомбардиры', data: scorerData, backgroundColor: COLORS.blue, borderRadius: 4, borderSkipped: false },
      { label: 'Ассистенты', data: assistData, backgroundColor: COLORS.purple, borderRadius: 4, borderSkipped: false }
    ] },
    options: chartOpts({ 
      plugins: { legend: { display: true, position: 'top', labels: { color: c.text, boxWidth: 12, boxHeight: 12, useBorderRadius: true, borderRadius: 2, padding: 12 } } },
      scales: {
        x: { grid: { display: false }, ticks: { color: c.text, font: { size: 11, weight: '500' } }, border: { display: false } },
        y: { 
          reverse: true, 
          grid: { color: c.grid, drawBorder: false }, 
          ticks: { color: c.textMuted, font: { size: 11 }, stepSize: 1, callback: v => '#' + v }, 
          border: { display: false }, 
          beginAtZero: false,
          title: { display: true, text: 'Место (меньше = лучше)', color: c.textMuted, font: { size: 11 } }
        }
      }
    })
  });
}

function renderGoalsAssistsChart() {
  destroyChart('chart-goals-assists');
  const ctx = document.getElementById('chart-goals-assists').getContext('2d');
  const c = getChartColors();
  const labels = [], goals = [], assists = [];
  tournamentOrder.forEach(key => {
    const t = tournaments[key];
    if (!t) return;
    labels.push(t.name);
    goals.push(t.summary.goals);
    assists.push(t.summary.assists);
  });
  if (labels.length === 0) {
    chartInstances['chart-goals-assists'] = new Chart(ctx, { type: 'bar', data: { labels: ['Нет данных'], datasets: [{ data: [0], backgroundColor: c.emptyBar }] }, options: chartOpts({ plugins: { legend: { display: false } } }) });
    return;
  }
  chartInstances['chart-goals-assists'] = new Chart(ctx, {
    type: 'bar',
    data: { labels, datasets: [
      { label: 'Голы', data: goals, backgroundColor: COLORS.green, borderRadius: 4, borderSkipped: false },
      { label: 'Ассисты', data: assists, backgroundColor: COLORS.blue, borderRadius: 4, borderSkipped: false }
    ] },
    options: chartOpts({ 
      plugins: { legend: { display: true, position: 'top', labels: { color: c.text, boxWidth: 12, boxHeight: 12, useBorderRadius: true, borderRadius: 2, padding: 12 } } },
      scales: {
        x: { grid: { display: false }, ticks: { color: c.text, font: { size: 11 } }, border: { display: false } },
        y: { grid: { color: c.grid, drawBorder: false }, ticks: { color: c.textMuted, font: { size: 11 }, stepSize: 1 }, border: { display: false }, beginAtZero: true }
      }
    })
  });
}

function renderDiffChart() {
  destroyChart('chart-diff');
  const ctx = document.getElementById('chart-diff').getContext('2d');
  const c = getChartColors();
  const sorted = [];
  tournamentOrder.forEach(key => {
    const t = tournaments[key];
    if (!t || t.teams.length === 0) return;
    t.teams.forEach(teamEntry => {
      const globalTeam = getTeamById(teamEntry.teamId);
      if (!globalTeam) return;
      const diff = teamEntry.w - teamEntry.l;
      sorted.push({ l: globalTeam.name, v: diff, c: globalTeam.isMe ? COLORS.myTeam : (diff > 0 ? COLORS.green : diff < 0 ? COLORS.red : COLORS.slate) });
    });
  });
  sorted.sort((a, b) => b.v - a.v);
  if (sorted.length === 0) {
    chartInstances['chart-diff'] = new Chart(ctx, { type: 'bar', data: { labels: ['Нет данных'], datasets: [{ data: [0], backgroundColor: c.emptyBar }] }, options: chartOpts({ plugins: { legend: { display: false } } }) });
    return;
  }
  chartInstances['chart-diff'] = new Chart(ctx, {
    type: 'bar',
    data: { labels: sorted.map(s => s.l), datasets: [{ data: sorted.map(s => s.v), backgroundColor: sorted.map(s => s.c), borderRadius: 4, borderSkipped: false, barThickness: 16 }] },
    options: chartOpts({ plugins: { legend: { display: false } }, scales: { x: { grid: { display: false }, ticks: { color: c.text, font: { size: 10 }, maxRotation: 60, minRotation: 45 }, border: { display: false } }, y: { grid: { color: c.grid, drawBorder: false }, ticks: { color: c.textMuted, font: { size: 11 }, stepSize: 1 }, border: { display: false } } } })
  });
}

function renderProgressChart() {
  destroyChart('chart-progress');
  const ctx = document.getElementById('chart-progress').getContext('2d');
  const c = getChartColors();
  const labels = [], played = [], total = [];
  tournamentOrder.forEach(key => {
    const t = tournaments[key];
    const my = getMyTeamInTournament(key);
    if (!my) return;
    labels.push(t.name);
    const groupPlayed = my.entry.w + my.entry.d + my.entry.l;
    const playoffPlayed = t.playoffMatches.filter(m => m.result === 'win' || m.result === 'loss' || m.result === 'draw').length;
    played.push(groupPlayed + playoffPlayed);
    total.push(getTotalPossibleMatches(key));
  });
  if (labels.length === 0) {
    chartInstances['chart-progress'] = new Chart(ctx, { type: 'bar', data: { labels: ['Нет данных'], datasets: [{ data: [0], backgroundColor: c.emptyBar }] }, options: chartOpts({ plugins: { legend: { display: false } } }) });
    return;
  }
  chartInstances['chart-progress'] = new Chart(ctx, {
    type: 'bar',
    data: { labels, datasets: [
      { label: 'Сыграно', data: played, backgroundColor: COLORS.green, borderRadius: 4, borderSkipped: false },
      { label: 'Всего', data: total, backgroundColor: c.emptyBar, borderRadius: 4, borderSkipped: false }
    ] },
    options: chartOpts({ 
      plugins: { legend: { display: true, position: 'top', labels: { color: c.text, boxWidth: 12, boxHeight: 12, useBorderRadius: true, borderRadius: 2, padding: 12 } } },
      scales: {
        x: { grid: { display: false }, ticks: { color: c.text, font: { size: 11 } }, border: { display: false } },
        y: { grid: { color: c.grid, drawBorder: false }, ticks: { color: c.textMuted, font: { size: 11 }, stepSize: 1 }, border: { display: false }, beginAtZero: true }
      }
    })
  });
}

function renderEfficiencyChart() {
  destroyChart('chart-efficiency');
  const ctx = document.getElementById('chart-efficiency').getContext('2d');
  const c = getChartColors();
  const labels = [], efficiency = [];
  tournamentOrder.forEach(key => {
    const t = tournaments[key];
    const my = getMyTeamInTournament(key);
    if (!my) return;
    labels.push(t.name);
    const total = my.entry.w + my.entry.d + my.entry.l;
    const eff = total > 0 ? ((my.entry.w / total) * 100).toFixed(1) : 0;
    efficiency.push(parseFloat(eff));
  });
  if (labels.length === 0) {
    chartInstances['chart-efficiency'] = new Chart(ctx, { type: 'bar', data: { labels: ['Нет данных'], datasets: [{ data: [0], backgroundColor: c.emptyBar }] }, options: chartOpts({ plugins: { legend: { display: false } } }) });
    return;
  }
  chartInstances['chart-efficiency'] = new Chart(ctx, {
    type: 'bar',
    data: { labels, datasets: [{ label: 'Эффективность %', data: efficiency, backgroundColor: COLORS.blue, borderRadius: 4, borderSkipped: false }] },
    options: chartOpts({ 
      plugins: { legend: { display: false } },
      scales: {
        x: { grid: { display: false }, ticks: { color: c.text, font: { size: 11 } }, border: { display: false } },
        y: { grid: { color: c.grid, drawBorder: false }, ticks: { color: c.textMuted, font: { size: 11 } }, border: { display: false }, beginAtZero: true, max: 100, title: { display: true, text: 'Процент побед', color: c.textMuted, font: { size: 11 } } }
      }
    })
  });
}

function renderRatingChart() {
  destroyChart('chart-rating');
  const ctx = document.getElementById('chart-rating').getContext('2d');
  const c = getChartColors();
  const labels = [], ratings = [], colors = [];
  tournamentOrder.forEach(key => {
    const t = tournaments[key];
    if (!t || t.summary.rating <= 0) return;
    labels.push(t.name);
    ratings.push(t.summary.rating);
    colors.push(getTournamentColor(key));
  });
  if (labels.length === 0) {
    chartInstances['chart-rating'] = new Chart(ctx, { type: 'bar', data: { labels: ['Нет данных'], datasets: [{ data: [0], backgroundColor: c.emptyBar }] }, options: chartOpts({ plugins: { legend: { display: false } } }) });
    return;
  }
  chartInstances['chart-rating'] = new Chart(ctx, {
    type: 'bar',
    data: { labels, datasets: [{ label: 'Рейтинг', data: ratings, backgroundColor: colors, borderRadius: 4, borderSkipped: false }] },
    options: chartOpts({ 
      plugins: { legend: { display: false } },
      scales: {
        x: { grid: { display: false }, ticks: { color: c.text, font: { size: 11 } }, border: { display: false } },
        y: { grid: { color: c.grid, drawBorder: false }, ticks: { color: c.textMuted, font: { size: 11 } }, border: { display: false }, beginAtZero: true, max: 10, title: { display: true, text: 'Рейтинг', color: c.textMuted, font: { size: 11 } } }
      }
    })
  });
}

function renderAchievementsChart() {
  destroyChart('chart-achievements');
  const ctx = document.getElementById('chart-achievements').getContext('2d');
  const c = getChartColors();
  const counts = { 'Чемпионство': 0, '2 место': 0, '3-4 место': 0, '5-8 место': 0, '9-16 место': 0, 'Другое': 0 };
  tournamentOrder.forEach(key => {
    const a = getAchievement(key);
    if (!a) return;
    if (a === 'Чемпионство') counts['Чемпионство']++;
    else if (a === '2 место') counts['2 место']++;
    else if (a.startsWith('3-4')) counts['3-4 место']++;
    else if (a.startsWith('5-8')) counts['5-8 место']++;
    else if (a.startsWith('9-16')) counts['9-16 место']++;
    else if (a.includes('место')) counts['Другое']++;
  });
  const labels = Object.keys(counts).filter(k => counts[k] > 0);
  const data = labels.map(k => counts[k]);
  const colors = ['#10b981', '#3b82f6', '#8b5cf6', '#f59e0b', '#ef4444', '#64748b'];
  if (labels.length === 0) {
    chartInstances['chart-achievements'] = new Chart(ctx, { type: 'doughnut', data: { labels: ['Нет данных'], datasets: [{ data: [1], backgroundColor: [c.emptyBar] }] }, options: chartOpts({ plugins: { legend: { display: false } } }) });
    return;
  }
  chartInstances['chart-achievements'] = new Chart(ctx, {
    type: 'doughnut',
    data: { labels, datasets: [{ data, backgroundColor: colors.slice(0, labels.length), borderWidth: 0 }] },
    options: chartOpts({ 
      plugins: { legend: { display: true, position: 'right', labels: { color: c.text, boxWidth: 12, boxHeight: 12, useBorderRadius: true, borderRadius: 2, padding: 12 } } }
    })
  });
}

function renderPieChart() {
  destroyChart('chart-pie');
  const ctx = document.getElementById('chart-pie').getContext('2d');
  const c = getChartColors();
  let totalWins = 0, totalDraws = 0, totalLosses = 0;
  tournamentOrder.forEach(key => {
    const t = tournaments[key];
    const my = getMyTeamInTournament(key);
    if (!my) return;
    totalWins += my.entry.w;
    totalDraws += my.entry.d;
    totalLosses += my.entry.l;
  });
  if (totalWins === 0 && totalDraws === 0 && totalLosses === 0) {
    chartInstances['chart-pie'] = new Chart(ctx, { type: 'doughnut', data: { labels: ['Нет данных'], datasets: [{ data: [1], backgroundColor: [c.emptyBar] }] }, options: chartOpts({ plugins: { legend: { display: false } } }) });
    return;
  }
  chartInstances['chart-pie'] = new Chart(ctx, {
    type: 'doughnut',
    data: { labels: ['Победы', 'Ничьи', 'Поражения'], datasets: [{ data: [totalWins, totalDraws, totalLosses], backgroundColor: [COLORS.green, COLORS.amber, COLORS.red], borderWidth: 0 }] },
    options: chartOpts({ 
      plugins: { legend: { display: true, position: 'top', labels: { color: c.text, boxWidth: 12, boxHeight: 12, useBorderRadius: true, borderRadius: 2, padding: 12 } } }
    })
  });
}

function renderCareer() {
  const container = document.getElementById('career-content');
  if (!container) return;

  const allTeams = new Set();
  const myTeamsMap = {};
  const trophies = [];
  let totalMatches = 0, totalGoals = 0, totalAssists = 0, totalMvp = 0;
  let ratingSum = 0, ratingCount = 0;
  let bestRating = 0, bestRatingTournament = '';
  let totalChampionships = 0;
  const h2h = {};
  const seasonHistory = [];

  seasons.forEach((s, sIdx) => {
    const sTeams = new Set();
    let sMatches = 0, sGoals = 0, sAssists = 0, sMvp = 0;
    let sRating = 0, sRatingCount = 0;
    let sChampionships = 0;

    Object.entries(s.tournaments || {}).forEach(([key, t]) => {
      (t.teams || []).forEach(te => {
        const gt = (s.globalTeams || []).find(g => g.id === te.teamId);
        if (!gt) return;
        allTeams.add(te.teamId);
        sTeams.add(te.teamId);
        if (gt.isMe) {
          const mapKey = gt.name + '|' + gt.flag;
          if (!myTeamsMap[mapKey]) {
            myTeamsMap[mapKey] = { name: gt.name, flag: gt.flag, seasons: [] };
          }
          if (!myTeamsMap[mapKey].seasons.includes(s.year)) myTeamsMap[mapKey].seasons.push(s.year);

          sMatches += te.w + te.d + te.l;

          (t.teams || []).forEach(opp => {
            if (opp.teamId === te.teamId) return;
            const oppGt = (s.globalTeams || []).find(g => g.id === opp.teamId);
            if (!oppGt) return;
            const h2hKey = [gt.name, oppGt.name].sort().join(' vs ');
            if (!h2h[h2hKey]) h2h[h2hKey] = { team1: gt.name, team1Flag: gt.flag, team2: oppGt.name, team2Flag: oppGt.flag, w: 0, d: 0, l: 0 };
            h2h[h2hKey].w += te.h2h[0];
            h2h[h2hKey].d += te.h2h[1];
            h2h[h2hKey].l += te.h2h[2];
          });
        }
      });

      sGoals += t.summary?.goals || 0;
      sAssists += t.summary?.assists || 0;
      sMvp += t.summary?.mvp || 0;
      if (t.summary?.rating > 0) { sRating += t.summary.rating; sRatingCount++; }

      const myEntry = (t.teams || []).find(te => {
        const gt = (s.globalTeams || []).find(g => g.id === te.teamId);
        return gt && gt.isMe;
      });
      if (myEntry) {
        const rank = t.teams.indexOf(myEntry) + 1;
        const isChamp = (rank === 1 && !t.hasPlayoff) ||
          (t.hasPlayoff && t.playoffMatches?.length > 0 &&
           t.playoffMatches[t.playoffMatches.length - 1]?.round === 'Final' &&
           t.playoffMatches[t.playoffMatches.length - 1]?.result === 'win');
        if (isChamp) {
          sChampionships++;
          trophies.push({ emoji: t.emoji, name: t.name, season: s.year, type: 'champ' });
        } else if (rank === 2) {
          trophies.push({ emoji: t.emoji, name: t.name, season: s.year, type: 'silver' });
        }
        if (t.topScorer === 1) {
          trophies.push({ emoji: '👟', name: 'Золотая бутса — ' + t.name, season: s.year, type: 'boot' });
        }
      }
    });

    totalMatches += sMatches;
    totalGoals += sGoals;
    totalAssists += sAssists;
    totalMvp += sMvp;
    totalChampionships += sChampionships;
    if (sRatingCount > 0) { ratingSum += sRating; ratingCount += sRatingCount; }
    const avgRating = sRatingCount > 0 ? (sRating / sRatingCount).toFixed(1) : null;
    if (avgRating && parseFloat(avgRating) > bestRating) {
      bestRating = parseFloat(avgRating);
      bestRatingTournament = s.year;
    }

    seasonHistory.push({ year: s.year, matches: sMatches, goals: sGoals, assists: sAssists, rating: avgRating, championships: sChampionships, teams: sTeams.size });
  });

  const myTeams = Object.values(myTeamsMap).sort((a, b) => a.name.localeCompare(b.name, 'ru'));
  const avgRatingAll = ratingCount > 0 ? (ratingSum / ratingCount).toFixed(1) : '—';
  const h2hList = Object.values(h2h).filter(h => h.w + h.d + h.l > 0).sort((a, b) => (b.w + b.d * 0.5) - (a.w + a.d * 0.5)).slice(0, 15);

  const formatSeasons = (seasons) => {
    if (seasons.length === 1) return String(seasons[0]);
    return `${seasons[0]}–${seasons[seasons.length - 1]}`;
  };

  let html = '';

  html += `<div class="career-section">
    <div class="career-section-title">📊 Обзор карьеры</div>
    <div class="career-grid">
      <div class="career-stat highlight"><div class="label">🏆 Чемпионства</div><div class="value">${totalChampionships}</div><div class="sub">${seasons.length} сезонов</div></div>
      <div class="career-stat"><div class="label">⚽ Матчей</div><div class="value">${totalMatches}</div><div class="sub">${allTeams.size} команд</div></div>
      <div class="career-stat"><div class="label">🎯 Голов</div><div class="value">${totalGoals}</div><div class="sub">${totalAssists} ассистов</div></div>
      <div class="career-stat"><div class="label">⭐ Рейтинг</div><div class="value">${avgRatingAll}</div><div class="sub">${totalMvp} МВП</div></div>
    </div>
  </div>`;

  if (myTeams.length > 0) {
    html += `<div class="career-section">
      <div class="career-section-title">⚽ Мои команды</div>
      ${myTeams.map(team => `
        <div class="career-row">
          <div class="flag">${team.flag || '🏳️'}</div>
          <div class="info">
            <div class="name">${escapeHtml(team.name)}</div>
            <div class="meta">Сезоны: ${formatSeasons(team.seasons)}</div>
          </div>
        </div>
      `).join('')}
    </div>`;
  }

  if (trophies.length > 0) {
    const sorted = trophies.sort((a, b) => b.season - a.season);
    html += `<div class="career-section">
      <div class="career-section-title">🏆 Достижения</div>
      <div style="display:flex; flex-wrap:wrap; gap:4px;">
        ${sorted.map(t => {
          const cls = t.type === 'champ' ? ' champ' : t.type === 'silver' ? ' silver' : t.type === 'boot' ? ' boot' : '';
          const label = t.type === 'champ' ? '' : t.type === 'silver' ? ' — 2 место' : t.type === 'boot' ? '' : '';
          return `<div class="career-trophy${cls}"><span class="emoji">${escapeHtml(t.emoji)}</span><span class="text">${escapeHtml(t.name)}${label} (${t.season})</span></div>`;
        }).join('')}
      </div>
    </div>`;
  }

  if (seasonHistory.length > 0) {
    html += `<div class="career-section">
      <div class="career-section-title">📅 История сезонов</div>
      ${seasonHistory.map(s => `
        <div class="career-row">
          <div class="info">
            <div class="name">${s.year}</div>
            <div class="meta">${s.matches} матчей · ${s.goals} голов · ${s.assists} ассистов · ${s.rating || '—'} рейтинг${s.championships > 0 ? ' · 🏆 ' + s.championships : ''}</div>
          </div>
        </div>
      `).join('')}
    </div>`;
  }

  if (h2hList.length > 0) {
    html += `<div class="career-section">
      <div class="career-section-title">🤝 Постоянные встречи</div>
      ${h2hList.map(h => `
        <div class="career-row">
          <div class="flag">${h.team1Flag || '🏳️'}</div>
          <div class="info">
            <div class="name">${escapeHtml(h.team1)} vs ${escapeHtml(h.team2)}</div>
            <div class="meta">${h.w} побед · ${h.d} ничьих · ${h.l} поражений</div>
          </div>
          <div class="flag">${h.team2Flag || '🏳️'}</div>
        </div>
      `).join('')}
    </div>`;
  }

  if (bestRating > 0) {
    html += `<div class="career-section">
      <div class="career-section-title">🌟 Достижения</div>
      <div class="career-grid">
        <div class="career-stat highlight"><div class="label">Лучший рейтинг</div><div class="value">${bestRating}</div><div class="sub">Сезон ${bestRatingTournament}</div></div>
        <div class="career-stat"><div class="label">Всего голов</div><div class="value">${totalGoals}</div><div class="sub">за ${totalMatches} матчей</div></div>
        <div class="career-stat"><div class="label">Точность</div><div class="value">${totalMatches > 0 ? ((totalGoals / totalMatches) * 100).toFixed(0) : 0}%</div><div class="sub">голов за матч</div></div>
        <div class="career-stat"><div class="label">Сезонов</div><div class="value">${seasons.length}</div><div class="sub">${seasonHistory.reduce((s, h) => s + h.championships, 0)} чемпионств</div></div>
      </div>
    </div>`;
  }

  if (html === '') {
    html = '<div class="empty">Пока нет данных для карьеры. Начни играть!</div>';
  }

  container.innerHTML = html;
}

function renderAllCharts() {
  renderSummaryStats();
  renderPointsChart();
  renderFormSelector();
  renderFormChart();
  renderTopsChart();
  renderGoalsAssistsChart();
  renderDiffChart();
  renderProgressChart();
  renderEfficiencyChart();
  renderRatingChart();
  renderAchievementsChart();
  renderPieChart();
}
