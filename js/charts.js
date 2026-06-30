// ============ CHARTS ============
const chartInstances = {};
let currentFormTournament = null;

function getChartColors() {
  const dark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  return {
    text: dark ? '#e0e0e0' : '#1a1a1a',
    textMuted: dark ? '#888' : '#737373',
    grid: dark ? 'rgba(255,255,255,0.08)' : '#f0f0f0',
    tooltipBg: dark ? '#2a2a2a' : '#1a1a1a',
    emptyBar: dark ? '#333' : '#e5e5e5'
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
  const myTeamSeenInSeason = {};
  const trophies = [];
  let totalMatches = 0, totalGoals = 0, totalAssists = 0, totalMvp = 0;
  let totalWins = 0, totalDraws = 0, totalLosses = 0;
  let ratingSum = 0, ratingCount = 0;
  let bestRating = 0, bestRatingTournament = '';
  let totalChampionships = 0;
  const h2h = {};
  const seasonHistory = [];
  const tournamentStats = {};

  seasons.forEach((s, sIdx) => {
    const sTeams = new Set();
    let sMatches = 0, sGoals = 0, sAssists = 0, sMvp = 0;
    let sWins = 0, sDraws = 0, sLosses = 0;
    let sRating = 0, sRatingCount = 0;
    let sChampionships = 0;

    Object.entries(s.tournaments || {}).forEach(([key, t]) => {
      (t.teams || []).forEach(te => {
        const gt = (s.globalTeams || []).find(g => g.id === te.teamId);
        if (!gt) return;
        allTeams.add(te.teamId);
        sTeams.add(te.teamId);
        if (gt.isMe) {
          const mapKey = gt.id;
          if (!myTeamsMap[mapKey]) {
            myTeamsMap[mapKey] = { name: gt.name, flag: gt.flag, seasons: [] };
            myTeamSeenInSeason[mapKey] = new Set();
          }
          if (!myTeamSeenInSeason[mapKey].has(s.year)) {
            myTeamsMap[mapKey].seasons.push(s.year);
            myTeamSeenInSeason[mapKey].add(s.year);
          }

          sMatches += te.w + te.d + te.l;
          sWins += te.w;
          sDraws += te.d;
          sLosses += te.l;

          if (!tournamentStats[t.name]) tournamentStats[t.name] = { emoji: t.emoji, wins: 0, trophies: 0 };
          tournamentStats[t.name].wins += te.w;

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
        const matchesPlayed = t.teams.reduce((sum, te) => sum + te.w + te.d + te.l, 0);
        const hasFinalResult = t.reachedPlayoff && t.playoffMatches?.length > 0 &&
          (t.playoffMatches[t.playoffMatches.length - 1]?.result === 'win' || t.playoffMatches[t.playoffMatches.length - 1]?.result === 'loss');
        if ((matchesPlayed > 0 || hasFinalResult) && isTournamentFinishedForSeason(s, key)) {
          const rank = t.teams.indexOf(myEntry) + 1;
          const lastFinal = (t.playoffMatches?.length > 0 &&
            t.playoffMatches[t.playoffMatches.length - 1]?.round === 'Final')
            ? t.playoffMatches[t.playoffMatches.length - 1] : null;
          const isChamp = lastFinal ? lastFinal.result === 'win' : (rank === 1 && !t.hasPlayoff);
          const isSilver = lastFinal ? lastFinal.result === 'loss' : (rank === 2 && !t.hasPlayoff);
          if (isChamp) {
            sChampionships++;
            trophies.push({ emoji: t.emoji, name: t.name, season: s.year, type: 'champ' });
            if (!tournamentStats[t.name]) tournamentStats[t.name] = { emoji: t.emoji, wins: 0, trophies: 0 };
            tournamentStats[t.name].trophies++;
          } else if (isSilver) {
            trophies.push({ emoji: t.emoji, name: t.name, season: s.year, type: 'silver' });
          }
          if (t.topScorer === 1) {
            trophies.push({ emoji: '🥇', name: 'Золотая бутса — ' + t.name, season: s.year, type: 'boot' });
          }
        }
      }
    });

    if (s.goldenBall) {
      trophies.push({ emoji: '🏆', name: 'Золотой Мяч', season: s.year, type: 'ball' });
    }

    totalMatches += sMatches;
    totalGoals += sGoals;
    totalAssists += sAssists;
    totalMvp += sMvp;
    totalWins += sWins;
    totalDraws += sDraws;
    totalLosses += sLosses;
    totalChampionships += sChampionships;
    if (sRatingCount > 0) { ratingSum += sRating; ratingCount += sRatingCount; }
    const avgRating = sRatingCount > 0 ? (sRating / sRatingCount).toFixed(1) : null;
    if (avgRating && parseFloat(avgRating) > bestRating) {
      bestRating = parseFloat(avgRating);
      bestRatingTournament = s.year;
    }

    seasonHistory.push({ year: s.year, matches: sMatches, goals: sGoals, assists: sAssists, wins: sWins, draws: sDraws, losses: sLosses, rating: avgRating, championships: sChampionships, teams: sTeams.size });
  });

  const myTeams = Object.values(myTeamsMap).sort((a, b) => Math.max(...b.seasons.map(Number)) - Math.max(...a.seasons.map(Number)));
  const avgRatingAll = ratingCount > 0 ? (ratingSum / ratingCount).toFixed(1) : '—';
  const h2hList = Object.values(h2h).filter(h => h.w + h.d + h.l > 0).sort((a, b) => (b.w + b.d * 0.5) - (a.w + a.d * 0.5)).slice(0, 10);
  const bestTournament = Object.entries(tournamentStats).sort((a, b) => b[1].trophies - a[1].trophies || b[1].wins - a[1].wins)[0];

  const formatSeasons = (seasons) => {
    const sorted = [...seasons].sort((a, b) => Number(a) - Number(b));
    if (sorted.length === 1) return String(sorted[0]);
    return `${sorted[0]}–${sorted[sorted.length - 1]}`;
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

  if (totalMatches > 0) {
    html += `<div class="career-section">
      <div class="career-section-title">📈 Статистика матчей</div>
      <div class="career-grid">
        <div class="career-stat"><div class="label">Победы</div><div class="value" style="color:#10b981;">${totalWins}</div><div class="sub">${totalMatches > 0 ? ((totalWins/totalMatches)*100).toFixed(0) : 0}%</div></div>
        <div class="career-stat"><div class="label">Ничьи</div><div class="value" style="color:#f59e0b;">${totalDraws}</div><div class="sub">${totalMatches > 0 ? ((totalDraws/totalMatches)*100).toFixed(0) : 0}%</div></div>
        <div class="career-stat"><div class="label">Поражения</div><div class="value" style="color:#ef4444;">${totalLosses}</div><div class="sub">${totalMatches > 0 ? ((totalLosses/totalMatches)*100).toFixed(0) : 0}%</div></div>
        <div class="career-stat"><div class="label">Точность</div><div class="value">${totalMatches > 0 ? ((totalGoals / totalMatches) * 100).toFixed(1) : 0}%</div><div class="sub">голов за матч</div></div>
      </div>
    </div>`;
  }

  if (myTeams.length > 0) {
    html += `<div class="career-section">
      <div class="career-section-title">⚽ Мои команды</div>
      ${myTeams.map(team => `
        <div class="career-row">
          <div class="flag">${flagHtml(team.flag) || '🏳️'}</div>
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
          const cls = t.type === 'champ' ? ' champ' : t.type === 'silver' ? ' silver' : t.type === 'boot' ? ' boot' : t.type === 'ball' ? ' ball' : '';
          const label = t.type === 'champ' ? '' : t.type === 'silver' ? ' — 2 место' : t.type === 'boot' ? '' : t.type === 'ball' ? '' : '';
          return `<div class="career-trophy${cls}"><span class="emoji">${escapeHtml(t.emoji)}</span><span class="text">${escapeHtml(t.name)}${label} (${t.season})</span></div>`;
        }).join('')}
      </div>
    </div>`;
  }

  if (bestTournament && bestTournament[1].trophies > 0) {
    html += `<div class="career-section">
      <div class="career-section-title">🏅 Лучший турнир</div>
      <div class="career-row">
        <div class="flag">${bestTournament[1].emoji || '🏆'}</div>
        <div class="info">
          <div class="name">${escapeHtml(bestTournament[0])}</div>
          <div class="meta">${bestTournament[1].trophies} трофеев · ${bestTournament[1].wins} побед</div>
        </div>
      </div>
    </div>`;
  }

  if (seasonHistory.length > 1) {
    html += `<div class="career-section">
      <div class="career-section-title">📈 Динамика по сезонам</div>
      <canvas id="career-dynamics-chart" style="width:100%; max-height:300px;"></canvas>
    </div>`;
  }

  // Tournament type analytics
  const typeStats = { league: { name: '🏆 Лиги', matches: 0, wins: 0, goals: 0, trophies: 0 }, cup: { name: '🥇 Кубки', matches: 0, wins: 0, goals: 0, trophies: 0 }, intl: { name: '🌍 Международные', matches: 0, wins: 0, goals: 0, trophies: 0 } };
  seasons.forEach(s => {
    Object.entries(s.tournaments || {}).forEach(([key, t]) => {
      const myEntry = (t.teams || []).find(te => {
        const gt = (s.globalTeams || []).find(g => g.id === te.teamId);
        return gt && gt.isMe;
      });
      if (!myEntry) return;
      const m = myEntry.w + myEntry.d + myEntry.l;
      const type = t.isInternational ? 'intl' : (t.hasPlayoff ? 'cup' : 'league');
      typeStats[type].matches += m;
      typeStats[type].wins += myEntry.w;
      typeStats[type].goals += t.summary?.goals || 0;
      const ach = isTournamentFinishedForSeason(s, key);
      if (ach) {
        const rank = t.teams.indexOf(myEntry) + 1;
        const hasFinalWin = t.playoffMatches?.length > 0 && t.playoffMatches[t.playoffMatches.length - 1]?.round === 'Final' && t.playoffMatches[t.playoffMatches.length - 1]?.result === 'win';
        if (rank === 1 || hasFinalWin) typeStats[type].trophies++;
      }
    });
  });
  const activeTypes = Object.values(typeStats).filter(t => t.matches > 0);
  if (activeTypes.length > 1) {
    html += `<div class="career-section">
      <div class="career-section-title">📊 Аналитика по типам турниров</div>
      <div class="career-grid" style="grid-template-columns: repeat(${Math.min(activeTypes.length, 3)}, 1fr);">
        ${activeTypes.map(t => `
          <div class="career-stat">
            <div class="label">${t.name}</div>
            <div class="value">${t.matches}</div>
            <div class="sub">${t.wins} побед · ${t.goals} голов · ${t.trophies > 0 ? '🏆 ' + t.trophies : 'без трофеев'}</div>
            <div style="margin-top:6px; height:4px; background:var(--border); border-radius:2px; overflow:hidden;">
              <div style="height:100%; width:${t.matches > 0 ? (t.wins / t.matches * 100).toFixed(0) : 0}%; background:#10b981;"></div>
            </div>
            <div style="font-size:10px; color:var(--text-muted); margin-top:2px;">${t.matches > 0 ? (t.wins / t.matches * 100).toFixed(0) : 0}% побед</div>
          </div>
        `).join('')}
      </div>
    </div>`;
  }

  if (seasonHistory.length > 1) {
    html += `<div class="career-section">
      <div class="career-section-title">📊 Сравнение сезонов</div>
      <canvas id="career-comparison-chart" style="width:100%; max-height:300px;"></canvas>
    </div>`;
  }

  if (seasonHistory.some(s => s.rating)) {
    html += `<div class="career-section">
      <div class="career-section-title">📈 Прогресс рейтинга</div>
      <canvas id="career-rating-chart" style="width:100%; max-height:250px;"></canvas>
    </div>`;
  }

  if (totalMatches > 0) {
    html += `<div class="career-section">
      <div class="career-section-title">🥧 Распределение результатов</div>
      <canvas id="career-pie-chart" style="width:100%; max-height:250px;"></canvas>
    </div>`;
  }

  if (seasonHistory.length > 0) {
    const sortedSeasons = [...seasonHistory].sort((a, b) => Number(b.year) - Number(a.year));
    html += `<div class="career-section">
      <div class="career-section-title">📅 История сезонов</div>
      ${sortedSeasons.map(s => `
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
      <div class="career-section-title">🤝 Частые соперники</div>
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

  html += `<div class="career-section">
    <div class="career-section-title">📤 Экспорт</div>
    <button class="btn btn-primary" onclick="exportCareer()">📋 Скопировать достижения</button>
  </div>`;

  if (html === '') {
    html = '<div class="empty">Пока нет данных для карьеры. Начни играть!</div>';
  }

  container.innerHTML = html;

  const sortedHistory = [...seasonHistory].sort((a, b) => Number(a.year) - Number(b.year));
  if (seasonHistory.length > 1) {
    renderCareerDynamicsChart(sortedHistory);
    renderCareerComparisonChart(sortedHistory);
  }
  if (seasonHistory.some(s => s.rating)) renderCareerRatingChart(sortedHistory);
  if (totalMatches > 0) renderCareerPieChart(totalWins, totalDraws, totalLosses);
}

function renderCareerDynamicsChart(data) {
  const ctx = document.getElementById('career-dynamics-chart');
  if (!ctx) return;
  const c = getChartColors();
  new Chart(ctx, {
    type: 'line',
    data: {
      labels: data.map(d => d.year),
      datasets: [
        { label: 'Голы', data: data.map(d => d.goals), borderColor: COLORS.green, backgroundColor: 'rgba(16,185,129,0.1)', tension: 0.3, fill: true, pointRadius: 4, pointBackgroundColor: COLORS.green },
        { label: 'Ассисты', data: data.map(d => d.assists), borderColor: COLORS.blue, backgroundColor: 'rgba(59,130,246,0.1)', tension: 0.3, fill: true, pointRadius: 4, pointBackgroundColor: COLORS.blue },
        { label: 'Победы', data: data.map(d => d.wins), borderColor: COLORS.amber, backgroundColor: 'rgba(245,158,11,0.05)', tension: 0.3, fill: false, pointRadius: 4, pointBackgroundColor: COLORS.amber, borderDash: [5, 3] }
      ]
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: { legend: { labels: { color: c.text, font: { size: 12 }, boxWidth: 12, padding: 12 } } },
      scales: {
        x: { grid: { display: false }, ticks: { color: c.text, font: { size: 11 } }, border: { display: false } },
        y: { grid: { color: c.grid }, ticks: { color: c.textMuted, font: { size: 11 } }, border: { display: false }, beginAtZero: true }
      }
    }
  });
}

function renderCareerComparisonChart(data) {
  const ctx = document.getElementById('career-comparison-chart');
  if (!ctx) return;
  const c = getChartColors();
  new Chart(ctx, {
    type: 'bar',
    data: {
      labels: data.map(d => d.year),
      datasets: [
        { label: 'Голы', data: data.map(d => d.goals), backgroundColor: COLORS.green, borderRadius: 4 },
        { label: 'Ассисты', data: data.map(d => d.assists), backgroundColor: COLORS.blue, borderRadius: 4 },
        { label: 'Победы', data: data.map(d => d.wins), backgroundColor: '#10b981', borderRadius: 4 }
      ]
    },
    options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { labels: { color: c.text } } }, scales: { x: { ticks: { color: c.text }, grid: { display: false } }, y: { ticks: { color: c.textMuted }, grid: { color: c.grid } } } }
  });
}

function renderCareerRatingChart(data) {
  const ctx = document.getElementById('career-rating-chart');
  if (!ctx) return;
  const c = getChartColors();
  const filtered = data.filter(d => d.rating);
  new Chart(ctx, {
    type: 'line',
    data: {
      labels: filtered.map(d => d.year),
      datasets: [{ label: 'Рейтинг', data: filtered.map(d => parseFloat(d.rating)), borderColor: COLORS.amber, backgroundColor: 'rgba(245,158,11,0.1)', fill: true, tension: 0.3, pointRadius: 5 }]
    },
    options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { labels: { color: c.text } } }, scales: { x: { ticks: { color: c.text }, grid: { display: false } }, y: { min: 1, max: 10, ticks: { color: c.textMuted }, grid: { color: c.grid } } } }
  });
}

function renderCareerPieChart(wins, draws, losses) {
  const ctx = document.getElementById('career-pie-chart');
  if (!ctx) return;
  const c = getChartColors();
  new Chart(ctx, {
    type: 'doughnut',
    data: { labels: ['Победы', 'Ничьи', 'Поражения'], datasets: [{ data: [wins, draws, losses], backgroundColor: [COLORS.green, COLORS.amber, COLORS.red], borderWidth: 0 }] },
    options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { labels: { color: c.text } } } }
  });
}

function exportCareer() {
  let text = '⚽ Карьера\n\n';
  seasons.forEach(s => {
    let hasData = false;
    Object.entries(s.tournaments || {}).forEach(([key, t]) => {
      const my = (t.teams || []).find(te => {
        const gt = (s.globalTeams || []).find(g => g.id === te.teamId);
        return gt && gt.isMe;
      });
      if (my && (my.w + my.d + my.l) > 0) hasData = true;
    });
    if (hasData) {
      text += `📅 Сезон ${s.year}\n`;
      Object.entries(s.tournaments || {}).forEach(([key, t]) => {
        const my = (t.teams || []).find(te => {
          const gt = (s.globalTeams || []).find(g => g.id === te.teamId);
          return gt && gt.isMe;
        });
        if (my && (my.w + my.d + my.l) > 0) {
          text += `  ${t.emoji} ${t.name}: ${my.w}/${my.d}/${my.l}\n`;
        }
      });
      if (s.goldenBall) text += '  ⚽ Золотой Мяч\n';
      text += '\n';
    }
  });
  navigator.clipboard.writeText(text).then(() => showToast('📋 Карьера скопирована')).catch(() => showToast('❌ Ошибка копирования'));
}

// ============ HEATMAP ============
function renderHeatmap() {
  const container = document.getElementById('heatmap-container');
  if (!container) return;
  const c = getChartColors();

  // Collect data: team -> tournament -> { w, d, l }
  const teamData = {};
  tournamentOrder.forEach(key => {
    const t = tournaments[key];
    if (!t) return;
    t.teams.forEach(te => {
      const gt = getTeamById(te.teamId);
      if (!gt) return;
      if (!teamData[gt.id]) teamData[gt.id] = { name: gt.name, flag: gt.flag, tournaments: {} };
      teamData[gt.id].tournaments[key] = { w: te.w, d: te.d, l: te.l, name: t.name };
    });
  });

  if (Object.keys(teamData).length === 0 || tournamentOrder.length === 0) {
    container.innerHTML = `<div class="empty">Нет данных для тепловой карты</div>`;
    return;
  }

  const tLabels = tournamentOrder.map(k => tournaments[k]?.name || k);
  const tWidth = Math.max(80, Math.min(120, Math.floor(700 / tLabels.length)));

  let html = `<table style="border-collapse:collapse; font-size:12px; width:100%; min-width:${160 + tLabels.length * tWidth}px;">`;
  html += `<thead><tr><th style="text-align:left; padding:6px 8px; color:${c.textMuted}; font-weight:500; min-width:140px; position:sticky; left:0; background:${c.tooltipBg}; z-index:1;">Команда</th>`;
  tLabels.forEach(name => {
    const short = name.length > 12 ? name.slice(0, 10) + '…' : name;
    html += `<th style="padding:6px 4px; color:${c.textMuted}; font-weight:500; width:${tWidth}px; text-align:center; font-size:11px;">${escapeHtml(short)}</th>`;
  });
  html += `<th style="padding:6px 8px; color:${c.textMuted}; font-weight:500; text-align:center;">В</th></tr></thead><tbody>`;

  const teamIds = Object.keys(teamData).sort((a, b) => {
    const aTotal = tournamentOrder.reduce((s, k) => { const d = teamData[a].tournaments[k]; return s + (d ? d.w * 3 + d.d : 0); }, 0);
    const bTotal = tournamentOrder.reduce((s, k) => { const d = teamData[b].tournaments[k]; return s + (d ? d.w * 3 + d.d : 0); }, 0);
    return bTotal - aTotal;
  });

  teamIds.forEach(tid => {
    const td = teamData[tid];
    const flagStr = td.flag ? `<span style="margin-right:4px;">${td.flag}</span>` : '';
    html += `<tr><td style="padding:4px 8px; white-space:nowrap; color:${c.text}; position:sticky; left:0; background:${c.tooltipBg}; z-index:1;">${flagStr}${escapeHtml(td.name)}</td>`;
    let totalW = 0;
    tournamentOrder.forEach(key => {
      const d = td.tournaments[key];
      if (!d) { html += `<td style="padding:4px; text-align:center; color:${c.textMuted};">—</td>`; return; }
      totalW += d.w;
      const total = d.w + d.d + d.l;
      const wPct = total > 0 ? d.w / total : 0;
      const dPct = total > 0 ? d.d / total : 0;
      const bg = wPct >= 0.5 ? `rgba(16,185,129,${0.3 + wPct * 0.5})` :
                 dPct >= 0.5 ? `rgba(245,158,11,${0.2 + dPct * 0.4})` :
                 `rgba(239,68,68,${0.2 + (1 - wPct) * 0.4})`;
      const textColor = wPct >= 0.5 ? '#10b981' : (dPct >= 0.5 ? '#f59e0b' : '#ef4444');
      html += `<td style="padding:4px; text-align:center; background:${bg}; color:${textColor}; font-weight:500; border:1px solid ${c.grid};">${d.w}/${d.d}/${d.l}</td>`;
    });
    html += `<td style="padding:4px 8px; text-align:center; color:${c.text}; font-weight:600;">${totalW}</td></tr>`;
  });

  html += '</tbody></table>';
  container.innerHTML = html;
}

// ============ COMPARISON ============
function renderComparison() {
  const container = document.getElementById('comparison-container');
  if (!container) return;
  const c = getChartColors();

  const teamList = globalTeams.filter(t => t.visible !== false).map(t => ({
    id: t.id, name: t.name, flag: t.flag || ''
  })).sort((a, b) => a.name.localeCompare(b.name, 'ru'));

  if (teamList.length < 2) {
    container.innerHTML = `<div class="empty">Нужно минимум 2 команды для сравнения</div>`;
    return;
  }

  const opts = teamList.map(t => `<option value="${t.id}">${t.flag} ${escapeHtml(t.name)}</option>`).join('');

  container.innerHTML = `
    <div style="display:flex; gap:8px; align-items:center; flex-wrap:wrap; margin-bottom:16px;">
      <select id="comp-team-a" style="flex:1; min-width:140px;">${opts}</select>
      <span style="font-weight:600; color:${c.textMuted};">VS</span>
      <select id="comp-team-b" style="flex:1; min-width:140px;">${opts}</select>
      <button class="btn btn-primary" onclick="runComparison()">Сравнить</button>
    </div>
    <div id="comp-result"></div>
  `;

  if (teamList.length >= 2) {
    document.getElementById('comp-team-b').selectedIndex = 1;
    runComparison();
  }
}

function getTeamStats(teamId) {
  let matches = 0, wins = 0, draws = 0, losses = 0;
  let h2hW = 0, h2hD = 0, h2hL = 0;
  let goals = 0, ratingSum = 0, ratingCount = 0, tournaments = 0;
  seasons.forEach(s => {
    Object.entries(s.tournaments || {}).forEach(([key, t]) => {
      const te = (t.teams || []).find(e => e.teamId === teamId);
      if (!te) return;
      const gt = (s.globalTeams || []).find(g => g.id === teamId);
      if (!gt) return;
      matches += te.w + te.d + te.l;
      wins += te.w; draws += te.d; losses += te.l;
      h2hW += te.h2h?.[0] || 0; h2hD += te.h2h?.[1] || 0; h2hL += te.h2h?.[2] || 0;
      if (gt.isMe) {
        goals += t.summary?.goals || 0;
        if (t.summary?.rating > 0) { ratingSum += t.summary.rating; ratingCount++; }
      }
      tournaments++;
    });
  });
  return { matches, wins, draws, losses, goals, h2hW, h2hD, h2hL, rating: ratingCount > 0 ? (ratingSum / ratingCount) : 0, tournaments };
}

function runComparison() {
  const aId = document.getElementById('comp-team-a').value;
  const bId = document.getElementById('comp-team-b').value;
  const result = document.getElementById('comp-result');
  if (!aId || !bId || aId === bId) { result.innerHTML = `<div class="empty">Выбери разные команды</div>`; return; }

  const aTeam = getTeamById(aId);
  const bTeam = getTeamById(bId);
  const a = getTeamStats(aId);
  const b = getTeamStats(bId);
  const c = getChartColors();

  const hasDataA = a.matches > 0;
  const hasDataB = b.matches > 0;

  // Find head-to-head between these two teams
  let h2hW = 0, h2hD = 0, h2hL = 0, h2hMatches = 0;
  seasons.forEach(s => {
    Object.values(s.tournaments || {}).forEach(t => {
      const teA = (t.teams || []).find(e => e.teamId === aId);
      const teB = (t.teams || []).find(e => e.teamId === bId);
      if (teA && teB) {
        h2hW += teA.h2h?.[0] || 0;
        h2hD += teA.h2h?.[1] || 0;
        h2hL += teA.h2h?.[2] || 0;
        h2hMatches += (teA.h2h?.[0] || 0) + (teA.h2h?.[1] || 0) + (teA.h2h?.[2] || 0);
      }
    });
  });

  const metrics = [
    { label: 'Матчи', a: a.matches, b: b.matches },
    { label: 'Победы', a: a.wins, b: b.wins },
    { label: 'Ничьи', a: a.draws, b: b.draws },
    { label: 'Поражения', a: a.losses, b: b.losses },
  ];
  if (a.goals > 0 || b.goals > 0) metrics.push({ label: 'Голы', a: a.goals, b: b.goals });
  if (a.rating > 0 || b.rating > 0) metrics.push({ label: 'Рейтинг', a: +a.rating.toFixed(1), b: +b.rating.toFixed(1) });
  metrics.push({ label: 'Турниры', a: a.tournaments, b: b.tournaments });

  const maxVal = Math.max(...metrics.map(m => Math.max(m.a, m.b)), 1);

  let html = `<div style="display:grid; grid-template-columns:1fr auto 1fr; gap:8px; margin-bottom:16px; align-items:center;">`;
  html += `<div style="text-align:center; font-weight:600; font-size:15px; color:${c.text};">${aTeam?.flag || ''} ${escapeHtml(aTeam?.name || '?')}</div>`;
  html += `<div style="color:${c.textMuted}; font-weight:600;">VS</div>`;
  html += `<div style="text-align:center; font-weight:600; font-size:15px; color:${c.text};">${bTeam?.flag || ''} ${escapeHtml(bTeam?.name || '?')}</div>`;

  metrics.forEach(m => {
    const aColor = m.a > m.b ? '#10b981' : (m.a === m.b ? c.text : c.textMuted);
    const bColor = m.b > m.a ? '#10b981' : (m.b === m.a ? c.text : c.textMuted);
    html += `<div style="text-align:right; padding:4px 8px; font-size:13px; color:${aColor}; font-weight:${m.a > m.b ? '600' : '400'};">${m.a}</div>`;
    html += `<div style="text-align:center; font-size:12px; color:${c.textMuted}; padding:4px 0; min-width:70px;">${m.label}</div>`;
    html += `<div style="text-align:left; padding:4px 8px; font-size:13px; color:${bColor}; font-weight:${m.b > m.a ? '600' : '400'};">${m.b}</div>`;
  });
  html += `</div>`;

  // H2H section
  if (h2hMatches > 0) {
    html += `<div style="padding:12px; background:${c.grid}; border-radius:8px; margin-bottom:16px; text-align:center;">`;
    html += `<div style="font-size:13px; font-weight:600; color:${c.text}; margin-bottom:8px;">⚔️ Встречи: ${h2hMatches} матчей</div>`;
    html += `<div style="display:flex; justify-content:center; gap:16px; font-size:14px;">`;
    html += `<span style="color:#10b981; font-weight:600;">${aTeam?.name?.slice(0, 8)}: ${h2hW}</span>`;
    html += `<span style="color:${c.textMuted};">Ничьи: ${h2hD}</span>`;
    html += `<span style="color:#3b82f6; font-weight:600;">${bTeam?.name?.slice(0, 8)}: ${h2hL}</span>`;
    html += `</div></div>`;
  }

  // Radar chart
  const radarId = 'comp-radar';
  html += `<div style="position:relative; width:100%; max-width:400px; margin:0 auto; height:300px;"><canvas id="${radarId}"></canvas></div>`;
  result.innerHTML = html;

  setTimeout(() => {
    destroyChart(radarId);
    const ctx = document.getElementById(radarId);
    if (!ctx) return;
    const radarLabels = ['Победы', 'Ничьи', 'Турниры'];
    if (a.goals > 0 || b.goals > 0) radarLabels.push('Голы');
    if (a.rating > 0 || b.rating > 0) radarLabels.push('Рейтинг');
    radarLabels.push('Эффективность');

    const norm = (val, max) => max > 0 ? val / max : 0;
    const maxW = Math.max(a.wins, b.wins, 1);
    const maxD = Math.max(a.draws, b.draws, 1);
    const maxT = Math.max(a.tournaments, b.tournaments, 1);
    const maxG = Math.max(a.goals, b.goals, 1);
    const maxR = Math.max(a.rating, b.rating, 1);
    const effA = a.matches > 0 ? a.wins / a.matches : 0;
    const effB = b.matches > 0 ? b.wins / b.matches : 0;
    const maxE = Math.max(effA, effB, 0.1);

    const dataA = [norm(a.wins, maxW), norm(a.draws, maxD), norm(a.tournaments, maxT)];
    const dataB = [norm(b.wins, maxW), norm(b.draws, maxD), norm(b.tournaments, maxT)];
    if (a.goals > 0 || b.goals > 0) { dataA.push(norm(a.goals, maxG)); dataB.push(norm(b.goals, maxG)); }
    if (a.rating > 0 || b.rating > 0) { dataA.push(norm(a.rating, maxR)); dataB.push(norm(b.rating, maxR)); }
    dataA.push(effA / maxE);
    dataB.push(effB / maxE);

    chartInstances[radarId] = new Chart(ctx, {
      type: 'radar',
      data: {
        labels: radarLabels,
        datasets: [
          { label: aTeam?.name || 'A', data: dataA, backgroundColor: 'rgba(59,130,246,0.2)', borderColor: '#3b82f6', borderWidth: 2, pointRadius: 3, pointBackgroundColor: '#3b82f6' },
          { label: bTeam?.name || 'B', data: dataB, backgroundColor: 'rgba(239,68,68,0.2)', borderColor: '#ef4444', borderWidth: 2, pointRadius: 3, pointBackgroundColor: '#ef4444' }
        ]
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: { legend: { labels: { color: c.text, font: { size: 12 } } } },
        scales: { r: { grid: { color: c.grid }, angleLines: { color: c.grid }, pointLabels: { color: c.text, font: { size: 11 } }, ticks: { display: false }, suggestedMin: 0, suggestedMax: 1 } }
      }
    });
  }, 50);
}

// ============ PREDICTION ============
function renderPrediction() {
  const container = document.getElementById('prediction-container');
  if (!container) return;
  const c = getChartColors();

  const teamList = globalTeams.filter(t => t.visible !== false).map(t => ({
    id: t.id, name: t.name, flag: t.flag || ''
  })).sort((a, b) => a.name.localeCompare(b.name, 'ru'));

  if (teamList.length < 2) {
    container.innerHTML = `<div class="empty">Нужно минимум 2 команды</div>`;
    return;
  }

  const opts = teamList.map(t => `<option value="${t.id}">${t.flag} ${escapeHtml(t.name)}</option>`).join('');
  container.innerHTML = `
    <div style="display:flex; gap:8px; align-items:center; flex-wrap:wrap; margin-bottom:16px;">
      <select id="pred-team-a" style="flex:1; min-width:140px;">${opts}</select>
      <span style="font-weight:600; color:${c.textMuted};">VS</span>
      <select id="pred-team-b" style="flex:1; min-width:140px;">${opts}</select>
      <button class="btn btn-primary" onclick="runPrediction()">Прогноз</button>
    </div>
    <div id="pred-result"></div>
  `;

  if (teamList.length >= 2) {
    document.getElementById('pred-team-b').selectedIndex = 1;
    runPrediction();
  }
}

function runPrediction() {
  const aId = document.getElementById('pred-team-a').value;
  const bId = document.getElementById('pred-team-b').value;
  const result = document.getElementById('pred-result');
  if (!aId || !bId || aId === bId) { result.innerHTML = `<div class="empty">Выбери разные команды</div>`; return; }

  const aTeam = getTeamById(aId);
  const bTeam = getTeamById(bId);
  const a = getTeamStats(aId);
  const b = getTeamStats(bId);
  const c = getChartColors();

  const calcStrength = (s) => {
    const total = s.matches || 1;
    const winPct = s.wins / total;
    const goalsPerMatch = s.goals / total;
    const eff = s.matches > 0 ? s.wins / s.matches : 0.33;
    return winPct * 3 + goalsPerMatch * 0.5 + s.rating * 0.1 + eff * 2;
  };

  const sA = Math.max(calcStrength(a), 0.1);
  const sB = Math.max(calcStrength(b), 0.1);
  const total = sA + sB;

  const winA = Math.round((sA / total) * 100);
  const winB = Math.round((sB / total) * 100);
  const draw = Math.max(0, 100 - winA - winB);
  const drawBias = 15;
  const adjA = Math.round(winA * (100 - drawBias) / 100);
  const adjB = Math.round(winB * (100 - drawBias) / 100);
  const adjDraw = 100 - adjA - adjB;

  const bar = (pct, color) => `<div style="height:32px; background:${color}; width:${pct}%; display:inline-flex; align-items:center; justify-content:center; font-size:13px; font-weight:600; color:#fff; min-width:${pct > 0 ? '40px' : '0'};">${pct > 5 ? pct + '%' : ''}</div>`;

  let html = `<div style="text-align:center; margin-bottom:12px; font-size:15px; font-weight:600; color:${c.text};">${aTeam?.flag || ''} ${escapeHtml(aTeam?.name || '?')} vs ${bTeam?.flag || ''} ${escapeHtml(bTeam?.name || '?')}</div>`;
  html += `<div style="border-radius:8px; overflow:hidden; margin-bottom:12px;">`;
  html += bar(adjA, '#10b981');
  html += bar(adjDraw, '#64748b');
  html += bar(adjB, '#3b82f6');
  html += `</div>`;
  html += `<div style="display:flex; justify-content:space-between; font-size:12px; color:${c.textMuted};">`;
  html += `<span>🟢 ${escapeHtml(aTeam?.name || 'A')}: ${adjA}%</span>`;
  html += `<span>⬜ Ничья: ${adjDraw}%</span>`;
  html += `<span>🔵 ${escapeHtml(bTeam?.name || 'B')}: ${adjB}%</span>`;
  html += `</div>`;

  // Factor explanation
  html += `<div style="margin-top:16px; padding:12px; background:${c.grid}; border-radius:6px; font-size:12px; color:${c.textMuted};">`;
  html += `<strong style="color:${c.text};">Факторы прогноза:</strong><br>`;
  html += `${escapeHtml(aTeam?.name || 'A')}: ${a.wins}W/${a.draws}D/${a.losses}L · ${a.goals} голов · ⭐ ${a.rating.toFixed(1)}<br>`;
  html += `${escapeHtml(bTeam?.name || 'B')}: ${b.wins}W/${b.draws}D/${b.losses}L · ${b.goals} голов · ⭐ ${b.rating.toFixed(1)}`;
  html += `</div>`;

  result.innerHTML = html;
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
  renderHeatmap();
  renderComparison();
  renderPrediction();
}
