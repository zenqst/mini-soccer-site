// ============ RENDERING ============
function renderTabs() {
  const container = document.getElementById('main-tabs');
  container.innerHTML = '';
  tournamentOrder.forEach(key => {
    const t = tournaments[key];
    if (!t) return;
    const btn = document.createElement('button');
    btn.className = 'tab';
    btn.dataset.tab = key;
    btn.textContent = `${t.emoji} ${t.name}`;
    btn.onclick = () => switchTab(key);
    container.appendChild(btn);
  });
  const statsBtn = document.createElement('button');
  statsBtn.className = 'tab';
  statsBtn.dataset.tab = 'stats';
  statsBtn.textContent = '📊 Статистика';
  statsBtn.onclick = () => switchTab('stats');
  container.appendChild(statsBtn);
  const careerBtn = document.createElement('button');
  careerBtn.className = 'tab';
  careerBtn.dataset.tab = 'career';
  careerBtn.textContent = '⭐ Карьера';
  careerBtn.onclick = () => switchTab('career');
  container.appendChild(careerBtn);
  const settingsBtn = document.createElement('button');
  settingsBtn.className = 'tab';
  settingsBtn.dataset.tab = 'settings';
  settingsBtn.textContent = '⚙️ Настройки';
  settingsBtn.onclick = () => switchTab('settings');
  container.appendChild(settingsBtn);
}

function switchTab(key) {
  document.querySelectorAll('#main-tabs .tab').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('.panel').forEach(p => p.classList.remove('active'));
  const btn = document.querySelector(`#main-tabs .tab[data-tab="${key}"]`);
  if (btn) btn.classList.add('active');
  const panel = document.getElementById('panel-' + key);
  if (panel) panel.classList.add('active');
  const isHiddenTab = key === 'career' || key === 'stats' || key === 'settings';
  document.getElementById('main-actions').style.display = isHiddenTab ? 'none' : '';
  document.getElementById('main-output').style.display = isHiddenTab ? 'none' : '';
  if (key === 'stats') setTimeout(renderAllCharts, 50);
  if (key === 'settings') renderSettingsPanel();
  if (key === 'career') renderCareer();
}

function renderPanels() {
  const container = document.getElementById('panels-container');
  container.innerHTML = '';
  tournamentOrder.forEach(key => {
    const t = tournaments[key];
    if (!t) return;
    const panel = document.createElement('div');
    panel.className = 'panel';
    panel.id = 'panel-' + key;
    panel.innerHTML = `
      <div class="card">
        <div class="card-header">
          <div class="card-title-wrap">
            <div class="card-title">${escapeHtml(t.emoji)} ${escapeHtml(t.name)}</div>
            <button class="icon-btn" onclick="openTournamentModal('${key}')" title="Настройки турнира">⚙️</button>
            ${t.hasPlayoff ? `<button class="icon-btn collapse-btn" onclick="toggleGroupCollapse('${key}')" title="Свернуть/развернуть группу" id="collapse-btn-${key}"></button>` : ''}
          </div>
          <button class="btn btn-sm" onclick="addTeamToTournament('${key}')">+ Команда</button>
        </div>
        <div class="top-stats" id="topstats-${key}"></div>
        <div id="teams-${key}"></div>
      </div>
      <div id="playoff-${key}"></div>
      <div id="summary-${key}"></div>
    `;
    container.appendChild(panel);
  });
}

function autoRate(key) {
  const t = tournaments[key];
  t.summary.rating = calcAutoRating(key);
  renderSummary(key);
  renderTopStats(key);
  debouncedSave();
  showToast(`Рейтинг: ${t.summary.rating}`);
}

function toggleGroupCollapse(key) {
  const t = tournaments[key];
  t.groupCollapsed = !t.groupCollapsed;
  renderTeams(key);
  debouncedSave();
}

function togglePlayoffCollapse(key) {
  const t = tournaments[key];
  t.playoffCollapsed = !t.playoffCollapsed;
  renderPlayoff(key);
  debouncedSave();
}

function updateCollapseButton(key) {
  const btn = document.getElementById('collapse-btn-' + key);
  if (!btn) return;
  const t = tournaments[key];
  btn.textContent = t.groupCollapsed ? '▶ Группа' : '▼ Группа';
}

function renderTopStats(key) {
  const t = tournaments[key];
  const container = document.getElementById('topstats-' + key);
  if (!container) return;
  container.innerHTML = `
    <div class="top-stats-title">⭐ Мои показатели</div>
    <div class="field-group" style="flex:1; min-width:0;">
      <span class="field-label">Место в топе бомбардиров</span>
      <input type="text" inputmode="numeric" value="${t.topScorer ?? ''}" placeholder="—" data-field="topScorer" data-focus-id="top-${key}-scorer">
    </div>
    <div class="field-group" style="flex:1; min-width:0;">
      <span class="field-label">Место в топе ассистентов</span>
      <input type="text" inputmode="numeric" value="${t.topAssist ?? ''}" placeholder="—" data-field="topAssist" data-focus-id="top-${key}-assist">
    </div>
  `;
  container.querySelectorAll('input').forEach(input => {
    input.addEventListener('input', (e) => {
      const field = e.target.dataset.field;
      const val = e.target.value === '' ? null : parseIntSafe(e.target.value);
      if (field === 'topScorer') t.topScorer = val;
      else if (field === 'topAssist') t.topAssist = val;
      debouncedSave();
    });
  });
}

function renderTeams(key) {
  const t = tournaments[key];
  const container = document.getElementById('teams-' + key);
  if (!container) return;
  
  const focusState = saveFocusState();
  
  updateCollapseButton(key);
  
  const my = getMyTeamInTournament(key);
  const groupMatches = my ? my.entry.w + my.entry.d + my.entry.l : 0;
  if (t.hasPlayoff && groupMatches >= t.rounds && t.playoffMatches.length > 0 && t.groupCollapsed === undefined) {
    t.groupCollapsed = true;
  }
  
  const groupCollapsed = t.groupCollapsed || false;
  
  if (groupCollapsed && t.hasPlayoff) {
    container.innerHTML = `
      <div class="group-collapsed-hint">
        Групповая стадия свёрнута (${t.teams.length} команд). 
        <button class="btn btn-sm" onclick="toggleGroupCollapse('${key}')" style="margin-left:8px;">Развернуть</button>
      </div>
    `;
    renderPlayoff(key);
    renderSummary(key);
    return;
  }
  
  container.innerHTML = '';
  
  t.teams.forEach((teamEntry, idx) => {
    const globalTeam = getTeamById(teamEntry.teamId);
    const isMe = globalTeam ? globalTeam.isMe : false;
    
    const row = document.createElement('div');
    row.className = 'team-row auto' + (isMe ? ' my-team' : '');
    row.dataset.idx = idx;
    
    const badge = isMe ? '<span class="my-team-badge">ваша</span>' : '';
    const pts = calcPoints(key, teamEntry.w, teamEntry.d);
    
    row.innerHTML = `
      <div style="display:flex; gap:8px; align-items:center;">
        <select data-field="teamId" data-focus-id="team-${key}-${idx}-id" style="flex:1;">
          <option value="">Выбери команду</option>
          ${getSortedTeams(key).map(gt => `<option value="${gt.id}" ${gt.id === teamEntry.teamId ? 'selected' : ''}>${gt.flag ? gt.flag + ' ' : ''}${escapeHtml(gt.name || '(без названия)')}${gt.isMe ? ' ★' : ''}</option>`).join('')}
        </select>
        ${badge}
        <button class="btn btn-danger btn-sm" onclick="removeTeam('${key}', ${idx})">✕</button>
      </div>
      <div style="display:flex; gap:12px; align-items:flex-end; flex-wrap:wrap;">
        <div class="field-group" style="flex:1; min-width:60px;"><span class="field-label">Победы</span><input type="text" inputmode="numeric" value="${teamEntry.w}" data-field="w" data-focus-id="team-${key}-${idx}-w"></div>
        <div class="field-group" style="flex:1; min-width:60px;"><span class="field-label">Ничьи</span><input type="text" inputmode="numeric" value="${teamEntry.d}" data-field="d" data-focus-id="team-${key}-${idx}-d"></div>
        <div class="field-group" style="flex:1; min-width:60px;"><span class="field-label">Поражения</span><input type="text" inputmode="numeric" value="${teamEntry.l}" data-field="l" data-focus-id="team-${key}-${idx}-l"></div>
        <div class="field-group" style="flex:1; min-width:60px;"><span class="field-label">Очки</span><div class="points-display">${pts}</div></div>
      </div>
      <div class="fields">
        <div class="field-group h2h-row ${isMe ? 'h2h-hidden' : ''}"><span class="field-label">1-на-1: П</span><input type="text" inputmode="numeric" value="${teamEntry.h2h[0]}" data-field="h2h-w" data-focus-id="team-${key}-${idx}-h2hw"></div>
        <div class="field-group h2h-row ${isMe ? 'h2h-hidden' : ''}"><span class="field-label">1-на-1: Н</span><input type="text" inputmode="numeric" value="${teamEntry.h2h[1]}" data-field="h2h-d" data-focus-id="team-${key}-${idx}-h2hd"></div>
        <div class="field-group h2h-row ${isMe ? 'h2h-hidden' : ''}"><span class="field-label">1-на-1: ПР</span><input type="text" inputmode="numeric" value="${teamEntry.h2h[2]}" data-field="h2h-l" data-focus-id="team-${key}-${idx}-h2hl"></div>
      </div>
      ${isMe ? '<div class="my-team-note">💡 Для вашей команды H2H не указывается</div>' : ''}
    `;
    
    row.querySelectorAll('input, select').forEach(input => {
      const isSelect = input.tagName === 'SELECT';
      input.addEventListener(isSelect ? 'change' : 'input', (e) => {
        const field = e.target.dataset.field;
        const entry = tournaments[key].teams[idx];
        if (field === 'teamId') {
          entry.teamId = e.target.value;
          renderTeams(key);
          debouncedSave();
          return;
        } else if (field === 'w') entry.w = parseIntSafe(e.target.value);
        else if (field === 'd') entry.d = parseIntSafe(e.target.value);
        else if (field === 'l') entry.l = parseIntSafe(e.target.value);
        else if (field === 'h2h-w') entry.h2h[0] = parseIntSafe(e.target.value);
        else if (field === 'h2h-d') entry.h2h[1] = parseIntSafe(e.target.value);
        else if (field === 'h2h-l') entry.h2h[2] = parseIntSafe(e.target.value);
        
        const ptsEl = row.querySelector('.points-display');
        if (ptsEl) ptsEl.textContent = calcPoints(key, entry.w, entry.d);
        
        renderPlayoff(key);
        renderSummary(key);
        debouncedSave();
      });
    });
    
    container.appendChild(row);
  });
  
  restoreFocus(focusState, container);
  
  renderPlayoff(key);
  renderSummary(key);
}

function addTeamToTournament(key) {
  tournaments[key].teams.push({ teamId: '', w: 0, d: 0, l: 0, h2h: [0, 0, 0] });
  renderTeams(key);
  debouncedSave();
}

function removeTeam(key, idx) {
  tournaments[key].teams.splice(idx, 1);
  renderTeams(key);
  debouncedSave();
}

function addGlobalTeam() {
  globalTeams.push({ id: 'team_' + Date.now(), name: '', isMe: false, flag: '', visible: true });
  renderGlobalTeams();
  tournamentOrder.forEach(k => { renderTeams(k); });
  debouncedSave();
}

function removeGlobalTeam(idx) {
  const removed = globalTeams.splice(idx, 1)[0];
  if (removed) {
    tournamentOrder.forEach(key => {
      tournaments[key].teams = tournaments[key].teams.filter(t => t.teamId !== removed.id);
    });
  }
  renderGlobalTeams();
  tournamentOrder.forEach(k => renderTeams(k));
  debouncedSave();
}

function renderGlobalTeams() {
  const container = document.getElementById('global-teams-list');
  if (!container) return;
  
  const focusState = saveFocusState();
  
  container.innerHTML = '';
  const sorted = globalTeams.map((team, idx) => ({ team, idx })).sort((a, b) => {
    if (a.team.isMe && !b.team.isMe) return -1;
    if (!a.team.isMe && b.team.isMe) return 1;
    return a.team.name.localeCompare(b.team.name, 'ru');
  });
  sorted.forEach(({ team, idx }) => {
    const item = document.createElement('div');
    item.className = 'team-list-item' + (team.isMe ? ' my-team' : '');
    item.innerHTML = `
      <button class="flag-preview" onclick="openFlagForGlobalTeam(${idx})" title="Выбрать флаг">${team.flag || '🏳️'}</button>
      <input type="text" value="${escapeHtml(team.name)}" placeholder="Название команды" style="flex:1; min-width:150px;" data-field="name" data-idx="${idx}" data-focus-id="gteam-${idx}-name">
      <label class="checkbox-row">
        <input type="checkbox" ${team.isMe ? 'checked' : ''} data-field="isMe" data-idx="${idx}" data-focus-id="gteam-${idx}-isme">
        Ваша
      </label>
      <button class="icon-btn" onclick="toggleTeamVisible(${idx})" title="${team.visible !== false ? 'Скрыть из выпадающих списков' : 'Показать в выпадающих списках'}" style="font-size:16px;${team.visible === false ? 'opacity:0.3;' : ''}">👁️</button>
      <button class="btn btn-danger btn-sm" onclick="removeGlobalTeam(${idx})">✕</button>
    `;
    
    item.querySelectorAll('input').forEach(input => {
      const field = input.dataset.field;
      const eventType = (field === 'isMe') ? 'change' : 'input';
      input.addEventListener(eventType, (e) => {
        const i = parseInt(e.target.dataset.idx);
        if (field === 'name') {
          globalTeams[i].name = e.target.value;
          tournamentOrder.forEach(k => updateTeamSelects(k));
          debouncedSave();
        } else if (field === 'isMe') {
          globalTeams[i].isMe = e.target.checked;
          renderGlobalTeams();
          tournamentOrder.forEach(k => renderTeams(k));
          debouncedSave();
        }
      });
    });
    
    container.appendChild(item);
  });
  
  restoreFocus(focusState, container);
}

function toggleTeamVisible(idx) {
  globalTeams[idx].visible = globalTeams[idx].visible === false ? true : false;
  renderGlobalTeams();
  tournamentOrder.forEach(k => renderTeams(k));
  debouncedSave();
}

function openFlagForGlobalTeam(idx) {
  const team = globalTeams[idx];
  openFlagModal(team.flag || '', (flag) => {
    team.flag = flag;
    renderGlobalTeams();
    tournamentOrder.forEach(k => {
      updateTeamSelects(k);
    });
    debouncedSave();
  });
}

function updateTeamSelects(key) {
  const container = document.getElementById('teams-' + key);
  if (!container) return;
  const rows = container.querySelectorAll('.team-row');
  rows.forEach((row, idx) => {
    const entry = tournaments[key].teams[idx];
    if (!entry) return;
    const select = row.querySelector('select[data-field="teamId"]');
    if (select) {
      const currentVal = select.value;
      select.innerHTML = `
        <option value="">Выбери команду</option>
        ${getSortedTeams(key).map(gt => `<option value="${gt.id}" ${gt.id === currentVal ? 'selected' : ''}>${gt.flag ? gt.flag + ' ' : ''}${escapeHtml(gt.name || '(без названия)')}${gt.isMe ? ' ★' : ''}</option>`).join('')}
      `;
    }
  });
}

function renderPlayoff(key) {
  const t = tournaments[key];
  const container = document.getElementById('playoff-' + key);
  if (!container) return;
  
  if (!t.hasPlayoff) {
    container.innerHTML = '';
    return;
  }
  
  const my = getMyTeamInTournament(key);
  const groupMatches = my ? my.entry.w + my.entry.d + my.entry.l : 0;
  const showPlayoff = groupMatches >= t.rounds;
  
  if (t.playoffMatches.length > 0 && !t.reachedPlayoff) {
    t.reachedPlayoff = true;
  }
  
  if (!showPlayoff) {
    container.innerHTML = '';
    return;
  }
  
  const playoffCollapsed = t.playoffCollapsed || false;
  
  container.innerHTML = `
    <div class="playoff-section">
      <div class="playoff-header">
        <div class="playoff-title">🏆 Плей-офф</div>
        <div style="display:flex; gap:8px; align-items:center;">
          <button class="btn btn-sm collapse-btn" onclick="togglePlayoffCollapse('${key}')">${playoffCollapsed ? '▶ Развернуть' : '▼ Свернуть'}</button>
          <label class="checkbox-row">
            <input type="checkbox" id="reached-playoff-${key}" ${t.reachedPlayoff ? 'checked' : ''}>
            Вышел в плей-офф
          </label>
        </div>
      </div>
      <div id="playoff-matches-${key}" ${playoffCollapsed ? 'style="display:none;"' : ''}></div>
    </div>
  `;
  
  document.getElementById('reached-playoff-' + key).addEventListener('change', (e) => {
    t.reachedPlayoff = e.target.checked;
    if (!t.reachedPlayoff) t.playoffMatches = [];
    renderPlayoff(key);
    renderSummary(key);
    debouncedSave();
  });
  
  if (t.reachedPlayoff && !playoffCollapsed) renderPlayoffMatches(key);
}

function renderPlayoffMatches(key) {
  const t = tournaments[key];
  const container = document.getElementById('playoff-matches-' + key);
  if (!container) return;
  
  const focusState = saveFocusState();
  
  const rounds = ['1/8', '1/4', '1/2', 'Final'];
  const resultLabels = { 'win': 'Победа', 'loss': 'Поражение', 'draw': 'Ничья', 'scheduled': 'Запланировано' };
  
  const matchesHtml = t.playoffMatches.map((match, idx) => {
    const statusClass = match.result || 'scheduled';
    return `
      <div class="playoff-match ${statusClass}">
        <div class="field-group">
          <span class="field-label">Раунд</span>
          <select data-idx="${idx}" data-field="round" data-focus-id="po-${key}-${idx}-round">
            ${rounds.map(r => `<option value="${r}" ${match.round === r ? 'selected' : ''}>${r}</option>`).join('')}
          </select>
        </div>
        <div class="field-group">
          <span class="field-label">Соперник</span>
          <select data-idx="${idx}" data-field="opponentTeamId" data-focus-id="po-${key}-${idx}-opp">
            <option value="">— выбери —</option>
            ${getSortedTeams(key).filter(gt => !gt.isMe).map(gt => `<option value="${gt.id}" ${gt.id === match.opponentTeamId ? 'selected' : ''}>${gt.flag ? gt.flag + ' ' : ''}${escapeHtml(gt.name || '(без названия)')}</option>`).join('')}
          </select>
        </div>
        <div class="field-group">
          <span class="field-label">Результат</span>
          <select data-idx="${idx}" data-field="result" data-focus-id="po-${key}-${idx}-res">
            ${Object.entries(resultLabels).map(([val, label]) => `<option value="${val}" ${match.result === val ? 'selected' : ''}>${label}</option>`).join('')}
          </select>
        </div>
        <div class="field-group">
          <span class="field-label">Дома</span>
          <label class="checkbox-row" style="padding:6px 0;">
            <input type="checkbox" data-idx="${idx}" data-field="isHome" ${match.isHome ? 'checked' : ''} data-focus-id="po-${key}-${idx}-home">
          </label>
        </div>
        <div class="field-group" style="justify-content:flex-end;">
          <button class="btn btn-danger btn-sm" onclick="removePlayoffMatch('${key}', ${idx})">✕</button>
        </div>
      </div>
    `;
  }).join('');
  
  container.innerHTML = matchesHtml + `
    <button class="btn btn-sm" onclick="addPlayoffMatch('${key}')" style="margin-top:8px;">+ Матч</button>
  `;
  
  container.querySelectorAll('select, input[type="checkbox"]').forEach(input => {
    const handler = (e) => {
      const idx = parseInt(e.target.dataset.idx);
      const field = e.target.dataset.field;
      if (isNaN(idx) || !field) return;
      const match = t.playoffMatches[idx];
      if (!match) return;
      
      if (field === 'isHome') match.isHome = e.target.checked;
      else match[field] = e.target.value;
      
      if (field === 'opponentTeamId') {
        t.playoffMatches.forEach((m, i) => {
          if (i !== idx && m.round === match.round) m.opponentTeamId = match.opponentTeamId;
        });
      }
      
      renderPlayoffMatches(key);
      renderSummary(key);
      debouncedSave();
    };
    input.addEventListener('change', handler);
  });
  
  restoreFocus(focusState, container);
}

function addPlayoffMatch(key) {
  const t = tournaments[key];
  const round = getNextRound(key);
  t.playoffMatches.push({ round: round, opponentTeamId: '', result: 'scheduled', isHome: false });
  
  const expectedMatches = t.customFormat[round] || 1;
  const matchesInRound = t.playoffMatches.filter(m => m.round === round);
  if (matchesInRound.length === 1 && expectedMatches === 2) {
    t.playoffMatches.push({ round: round, opponentTeamId: '', result: 'scheduled', isHome: true });
  }
  
  renderPlayoffMatches(key);
  renderSummary(key);
  debouncedSave();
}

function removePlayoffMatch(key, idx) {
  const t = tournaments[key];
  const match = t.playoffMatches[idx];
  const pairMatches = t.playoffMatches.filter((m, i) => 
    i !== idx && m.round === match.round && 
    (m.opponentTeamId === match.opponentTeamId || !match.opponentTeamId)
  );
  if (pairMatches.length === 1 && (t.customFormat[match.round] || 1) === 2) {
    const pairIdx = t.playoffMatches.indexOf(pairMatches[0]);
    if (pairIdx > idx) {
      t.playoffMatches.splice(pairIdx, 1);
      t.playoffMatches.splice(idx, 1);
    } else {
      t.playoffMatches.splice(idx, 1);
      t.playoffMatches.splice(pairIdx, 1);
    }
  } else {
    t.playoffMatches.splice(idx, 1);
  }
  renderPlayoffMatches(key);
  renderSummary(key);
  debouncedSave();
}

function buildSummaryText(key) {
  const t = tournaments[key];
  const achievement = getAchievement(key);
  const totalMatches = getTotalMatches(key);
  const s = t.summary;
  
  const parts = [];
  if (achievement) parts.push(achievement);
  if (t.topScorer === 1) parts.push('Золотая бутса');
  parts.push(`${totalMatches} матчей`);
  parts.push(`${s.goals} голов`);
  parts.push(`${s.assists} ассистов`);
  parts.push(`${s.mvp} МВП`);
  parts.push(`${s.accuracy}% точности`);
  parts.push(`${s.rating} рейтинга`);
  
  return `Итог ${t.name}: ${parts.join(', ')}`;
}

function renderSummary(key) {
  const t = tournaments[key];
  const container = document.getElementById('summary-' + key);
  if (!container) return;
  
  const finished = isTournamentFinished(key);
  
  if (!finished) {
    container.innerHTML = '';
    return;
  }
  
  const focusState = saveFocusState();
  const summaryText = finished ? buildSummaryText(key) : '';
  const s = t.summary;
  
  container.innerHTML = `
    <div class="summary-section">
      <div class="summary-title">${finished ? '📊 Итог турнира' : '📊 Мои показатели турнира'}</div>
      ${finished ? `<div class="summary-text">${escapeHtml(summaryText)}</div>` : ''}
      <div class="summary-fields">
        <div class="field-group"><span class="field-label">Голы</span><input type="text" inputmode="numeric" value="${s.goals}" data-field="goals" data-focus-id="sum-${key}-goals"></div>
        <div class="field-group"><span class="field-label">Ассисты</span><input type="text" inputmode="numeric" value="${s.assists}" data-field="assists" data-focus-id="sum-${key}-assists"></div>
        <div class="field-group"><span class="field-label">МВП</span><input type="text" inputmode="numeric" value="${s.mvp}" data-field="mvp" data-focus-id="sum-${key}-mvp"></div>
        <div class="field-group"><span class="field-label">Точность %</span><input type="text" inputmode="numeric" value="${s.accuracy}" data-field="accuracy" data-focus-id="sum-${key}-accuracy"></div>
        <div class="field-group"><span class="field-label">Рейтинг</span><div style="display:flex; gap:4px;"><input type="text" inputmode="decimal" value="${s.rating}" data-field="rating" placeholder="0.0" data-focus-id="sum-${key}-rating" style="flex:1;"><button class="btn btn-sm" onclick="autoRate('${key}')" title="Рассчитать автоматически">🎲</button></div></div>
      </div>
    </div>
  `;
  
  container.querySelectorAll('input').forEach(input => {
    input.addEventListener('input', (e) => {
      const field = e.target.dataset.field;
      if (field === 'rating') {
        t.summary[field] = parseNum(e.target.value);
      } else {
        t.summary[field] = parseIntSafe(e.target.value);
      }
      if (isTournamentFinished(key)) {
        const textEl = container.querySelector('.summary-text');
        if (textEl) textEl.textContent = buildSummaryText(key);
      }
      debouncedSave();
    });
  });
  
  restoreFocus(focusState, container);
}

let currentModalKey = null;

const TOURNAMENT_EMOJIS = [
  { v: '🏆', l: '🏆 Кубок' }, { v: '🌍', l: '🌍 Мир/Квалификация' }, { v: '🌎', l: '🌎 Америка' },
  { v: '🇪🇺', l: '🇪🇺 Европа' }, { v: '🇪🇸', l: '🇪🇸 Испания' }, { v: '🏴󠁧󠁢󠁥󠁧󠁿', l: '🏴 Англия' },
  { v: '🇮🇹', l: '🇮🇹 Италия' }, { v: '🇩🇪', l: '🇩🇪 Германия' }, { v: '🇫🇷', l: '🇫🇷 Франция' },
  { v: '🇷🇺', l: '🇷🇺 Россия' }, { v: '🇵🇹', l: '🇵🇹 Португалия' }, { v: '🇳🇱', l: '🇳🇱 Нидерланды' },
  { v: '🇧🇷', l: '🇧🇷 Бразилия' }, { v: '🇦🇷', l: '🇦🇷 Аргентина' }, { v: '🇨🇱', l: '🇨🇱 Чили' },
  { v: '🇨🇴', l: '🇨🇴 Колумбия' }, { v: '🇲🇽', l: '🇲🇽 Мексика' }, { v: '🇺🇸', l: '🇺🇸 США' },
  { v: '🇯🇵', l: '🇯🇵 Япония' }, { v: '🇰🇷', l: '🇰🇷 Южная Корея' }, { v: '🇨🇳', l: '🇨🇳 Китай' },
  { v: '🇹🇷', l: '🇹🇷 Турция' }, { v: '🇺🇦', l: '🇺🇦 Украина' }, { v: '🇵🇱', l: '🇵🇱 Польша' },
  { v: '🇧🇪', l: '🇧🇪 Бельгия' }, { v: '🇨🇭', l: '🇨🇭 Швейцария' }, { v: '🇦🇹', l: '🇦🇹 Австрия' },
  { v: '🏴󠁧󠁢󠁳󠁣󠁴󠁿', l: '🏴 Шотландия' }, { v: '🏴󠁧󠁢󠁷󠁬󠁿', l: '🏴 Уэльс' }, { v: '🇮🇪', l: '🇮🇪 Ирландия' },
  { v: '🇸🇪', l: '🇸🇪 Швеция' }, { v: '🇩🇰', l: '🇩🇰 Дания' }, { v: '🇳🇴', l: '🇳🇴 Норвегия' },
  { v: '🇨🇿', l: '🇨🇿 Чехия' }, { v: '🇷🇸', l: '🇷🇸 Сербия' }, { v: '🇭🇷', l: '🇭🇷 Хорватия' },
  { v: '🇷🇴', l: '🇷🇴 Румыния' }, { v: '🇬🇷', l: '🇬🇷 Греция' }, { v: '🇭🇺', l: '🇭🇺 Венгрия' }
];

function openTournamentModal(key) {
  currentModalKey = key;
  const t = tournaments[key];
  const emojiSelect = document.getElementById('modal-emoji');
  emojiSelect.innerHTML = TOURNAMENT_EMOJIS.map(e => `<option value="${e.v}" ${e.v === t.emoji ? 'selected' : ''}>${e.l}</option>`).join('') + `<option value="📝" ${!TOURNAMENT_EMOJIS.find(e => e.v === t.emoji) ? 'selected' : ''}>📝 Другое</option>`;
  document.getElementById('modal-name').value = t.name;
  document.getElementById('modal-rounds').value = t.rounds;
  document.getElementById('modal-limit').value = t.displayLimit || '';
  document.getElementById('modal-pts-win').value = t.pointsPerWin;
  document.getElementById('modal-pts-draw').value = t.pointsPerDraw;
  document.getElementById('modal-show-h2h').checked = t.showH2H;
  document.getElementById('modal-international').checked = t.isInternational || false;
  document.getElementById('modal-has-playoff').checked = t.hasPlayoff;
  updatePlayoffFormatUI();
  if (t.hasPlayoff) {
    document.getElementById('modal-playoff-format').value = t.playoffFormat;
    updateCustomFormatUI();
    document.getElementById('custom-1/8').value = t.customFormat['1/8'];
    document.getElementById('custom-1/4').value = t.customFormat['1/4'];
    document.getElementById('custom-1/2').value = t.customFormat['1/2'];
  }
  document.getElementById('tournament-modal').classList.add('show');
}

function updatePlayoffFormatUI() {
  const hasPlayoff = document.getElementById('modal-has-playoff').checked;
  document.getElementById('playoff-format-section').style.display = hasPlayoff ? 'block' : 'none';
}

function updateCustomFormatUI() {
  const format = document.getElementById('modal-playoff-format').value;
  document.getElementById('custom-format-fields').style.display = format === 'custom' ? 'block' : 'none';
}

document.getElementById('modal-has-playoff').addEventListener('change', updatePlayoffFormatUI);
document.getElementById('modal-playoff-format').addEventListener('change', updateCustomFormatUI);

function closeModal() {
  document.getElementById('tournament-modal').classList.remove('show');
  currentModalKey = null;
}

function saveTournamentSettings() {
  if (!currentModalKey) return;
  const t = tournaments[currentModalKey];
  t.emoji = document.getElementById('modal-emoji').value || '🏆';
  t.name = document.getElementById('modal-name').value || 'Турнир';
  t.rounds = Math.max(0, parseIntSafe(document.getElementById('modal-rounds').value));
  t.displayLimit = Math.max(0, parseIntSafe(document.getElementById('modal-limit').value));
  t.pointsPerWin = Math.max(0, parseIntSafe(document.getElementById('modal-pts-win').value));
  t.pointsPerDraw = Math.max(0, parseIntSafe(document.getElementById('modal-pts-draw').value));
  t.showH2H = document.getElementById('modal-show-h2h').checked;
  t.isInternational = document.getElementById('modal-international').checked;
  t.hasPlayoff = document.getElementById('modal-has-playoff').checked;
  if (t.hasPlayoff) {
    t.playoffFormat = document.getElementById('modal-playoff-format').value;
    if (t.playoffFormat === 'custom') {
      t.customFormat['1/8'] = parseIntSafe(document.getElementById('custom-1/8').value) || 1;
      t.customFormat['1/4'] = parseIntSafe(document.getElementById('custom-1/4').value) || 1;
      t.customFormat['1/2'] = parseIntSafe(document.getElementById('custom-1/2').value) || 1;
    } else if (t.playoffFormat === 'single') {
      t.customFormat = { '1/8': 1, '1/4': 1, '1/2': 1, 'Final': 1 };
    } else if (t.playoffFormat === 'double') {
      t.customFormat = { '1/8': 2, '1/4': 2, '1/2': 2, 'Final': 1 };
    }
  }
  renderTabs();
  renderPanels();
  tournamentOrder.forEach(k => { renderTopStats(k); renderTeams(k); });
  switchTab(currentModalKey);
  closeModal();
  debouncedSave();
  showToast('Настройки сохранены');
}

function deleteCurrentTournament() {
  if (!currentModalKey) return;
  if (!confirm(`Удалить турнир «${tournaments[currentModalKey].name}»?`)) return;
  const key = currentModalKey;
  delete tournaments[key];
  tournamentOrder = tournamentOrder.filter(k => k !== key);
  closeModal();
  renderTabs();
  renderPanels();
  tournamentOrder.forEach(k => { renderTopStats(k); renderTeams(k); });
  switchTab(tournamentOrder[0] || 'settings');
  debouncedSave();
  showToast('Турнир удалён');
}

function renderSettingsPanel() {
  renderSeasonsList();
  const list = document.getElementById('tournament-list');
  list.innerHTML = '';
  tournamentOrder.forEach(key => {
    const t = tournaments[key];
    if (!t) return;
    const item = document.createElement('div');
    item.className = 'tournament-list-item';
    item.innerHTML = `
      <span style="font-size:18px; width:28px; text-align:center; flex-shrink:0; display:inline-block;">${escapeHtml(t.emoji)}</span>
      <div style="flex:1; min-width:150px;">
        <div class="name">${escapeHtml(t.name)} ${t.isInternational ? '<span style="font-size:10px; color:var(--text-muted);">🌍</span>' : ''}</div>
        <div class="meta">${t.teams.length} команд · ${t.rounds} матчей · ${t.hasPlayoff ? 'плей-офф' : 'лига'}${t.displayLimit > 0 ? ` · топ-${t.displayLimit}` : ''}</div>
      </div>
      <button class="btn btn-sm" onclick="openTournamentModal('${key}')">⚙️</button>
    `;
    list.appendChild(item);
  });
  renderGlobalTeams();
}

let tournamentCounter = 0;
function addTournament() {
  tournamentCounter++;
  const key = 'custom_' + Date.now() + '_' + tournamentCounter;
  tournaments[key] = emptyTournament('🏆', 'Новый турнир', 10);
  tournamentOrder.push(key);
  renderTabs();
  renderPanels();
  renderTopStats(key);
  renderTeams(key);
  switchTab(key);
  openTournamentModal(key);
  debouncedSave();
}

function buildExportData() {
  syncCurrentSeason();
  return {
    version: 4,
    seasons: JSON.parse(JSON.stringify(seasons)),
    currentSeasonIdx
  };
}

function openDataModal(tab = 'export') {
  if (tab === 'export') {
    const data = buildExportData();
    document.getElementById('export-textarea').value = JSON.stringify(data, null, 2);
  } else {
    document.getElementById('import-textarea').value = '';
  }
  switchDataTab(tab);
  document.getElementById('data-modal').classList.add('show');
}

function closeDataModal() {
  document.getElementById('data-modal').classList.remove('show');
}

function openTeamManager() {
  renderTeamManager();
  document.getElementById('team-manager-modal').classList.add('show');
}

function closeTeamManager() {
  document.getElementById('team-manager-modal').classList.remove('show');
}

function renderTeamManager() {
  const body = document.getElementById('team-manager-body');
  if (!body) return;

  const sorted = [...globalTeams].map((t, i) => ({ t, i })).sort((a, b) => {
    if (a.t.isMe && !b.t.isMe) return -1;
    if (!a.t.isMe && b.t.isMe) return 1;
    return a.t.name.localeCompare(b.t.name, 'ru');
  });

  body.innerHTML = sorted.map(({ t, i }) => {
    const usedIn = [];
    tournamentOrder.forEach(k => {
      const tour = tournaments[k];
      if (tour.teams.some(te => te.teamId === t.id)) {
        usedIn.push(`${tour.emoji} ${tour.name}`);
      }
    });
    const seasonYears = seasons.filter(s => (s.globalTeams || []).some(gt => gt.id === t.id)).map(s => s.year);
    const metaParts = [];
    if (usedIn.length > 0) metaParts.push(`Турниры: ${usedIn.join(', ')}`);
    if (seasonYears.length > 0) metaParts.push(`Сезоны: ${formatSeasonRange(seasonYears)}`);

    return `<div class="tm-row${t.isMe ? ' my-team' : ''}">
      <button class="tm-flag" onclick="openFlagForGlobalTeam(${i}); renderTeamManager();" title="Выбрать флаг">${t.flag || '🏳️'}</button>
      <input type="text" value="${escapeHtml(t.name)}" placeholder="Название" onchange="globalTeams[${i}].name=this.value; renderGlobalTeams(); renderTeamManager(); debouncedSave();">
      <label class="checkbox-row"><input type="checkbox" ${t.isMe ? 'checked' : ''} onchange="globalTeams[${i}].isMe=this.checked; renderGlobalTeams(); renderTeamManager(); debouncedSave();"> Моя</label>
      <button class="icon-btn" onclick="toggleTeamVisible(${i}); renderTeamManager();" title="${t.visible !== false ? 'Скрыть' : 'Показать'}" style="font-size:16px;${t.visible === false ? 'opacity:0.3;' : ''}">👁️</button>
      <button class="btn btn-danger btn-sm" onclick="removeGlobalTeam(${i}); renderTeamManager();">✕</button>
      ${metaParts.length > 0 ? `<div class="tm-meta">${escapeHtml(metaParts.join(' · '))}</div>` : ''}
    </div>`;
  }).join('');
}

function formatSeasonRange(years) {
  if (!years || years.length === 0) return '';
  const sorted = [...years].sort((a, b) => a - b);
  if (sorted.length === 1) return String(sorted[0]);
  return `${sorted[0]}–${sorted[sorted.length - 1]}`;
}

function switchDataTab(tab) {
  document.querySelectorAll('.data-modal-tab').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('.data-modal-panel').forEach(p => p.classList.remove('active'));
  const tabBtn = document.querySelector(`.data-modal-tab[data-panel="${tab}"]`);
  if (tabBtn) tabBtn.classList.add('active');
  const panel = document.getElementById('data-panel-' + tab);
  if (panel) panel.classList.add('active');
  if (tab === 'export') {
    const data = buildExportData();
    document.getElementById('export-textarea').value = JSON.stringify(data, null, 2);
  }
}

function copyExportData() {
  const data = buildExportData();
  const json = JSON.stringify(data, null, 2);
  const textarea = document.getElementById('export-textarea');
  textarea.value = json;
  
  const done = () => showToast('✅ JSON скопирован');
  
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(json).then(done).catch(() => {
      textarea.select();
      try { document.execCommand('copy'); done(); } 
      catch (err) { showToast('❌ Не удалось скопировать'); }
    });
  } else {
    textarea.select();
    try { document.execCommand('copy'); done(); } 
    catch (err) { showToast('❌ Не удалось скопировать'); }
  }
}

function downloadExportFile() {
  try {
    const data = buildExportData();
    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: 'application/json;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const date = new Date().toISOString().slice(0,10);
    a.download = `tournaments_${date}.json`;
    a.style.display = 'none';
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 1000);
    showToast('✅ Файл скачивается');
  } catch (err) {
    showToast('⚠️ Ошибка: ' + err.message);
  }
}

function importFromText() {
  const text = document.getElementById('import-textarea').value.trim();
  if (!text) { showToast('⚠️ Вставь JSON'); return; }
  doImport(text);
}

function importFromFile(event) {
  const file = event.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (e) => doImport(e.target.result);
  reader.onerror = () => showToast('❌ Не удалось прочитать');
  reader.readAsText(file);
  event.target.value = '';
}

function normalizeTournament(v) {
  return {
    emoji: v.emoji || '🏆', name: v.name || 'Турнир',
    rounds: v.rounds || 10, displayLimit: v.displayLimit || 0,
    pointsPerWin: v.pointsPerWin ?? 3, pointsPerDraw: v.pointsPerDraw ?? 1,
    showH2H: v.showH2H ?? true, hasPlayoff: v.hasPlayoff ?? false,
    isInternational: v.isInternational ?? false,
    playoffFormat: v.playoffFormat || 'single',
    customFormat: v.customFormat || { '1/8': 2, '1/4': 2, '1/2': 2, 'Final': 1 },
    teams: v.teams || [], topScorer: v.topScorer ?? null, topAssist: v.topAssist ?? null,
    reachedPlayoff: v.reachedPlayoff ?? false, playoffMatches: v.playoffMatches || [],
    groupCollapsed: v.groupCollapsed, playoffCollapsed: v.playoffCollapsed,
    summary: {
      goals: v.summary?.goals || 0, assists: v.summary?.assists || 0,
      mvp: v.summary?.mvp || 0, accuracy: v.summary?.accuracy || 0,
      rating: v.summary?.rating || 0
    }
  };
}

function doImport(text) {
  try {
    const data = JSON.parse(text);
    
    if (data.tournaments && data.tournamentOrder && !data.seasons) {
      const year = new Date().getFullYear();
      seasons = [{
        year,
        tournamentOrder: data.tournamentOrder,
        tournaments: data.tournaments,
        globalTeams: data.globalTeams || []
      }];
      currentSeasonIdx = 0;
    } else if (data.seasons) {
      seasons = data.seasons.map(s => ({
        year: s.year,
        tournamentOrder: s.tournamentOrder || [],
        tournaments: s.tournaments || {},
        globalTeams: s.globalTeams || []
      }));
      currentSeasonIdx = data.currentSeasonIdx ?? 0;
      if (currentSeasonIdx < 0 || currentSeasonIdx >= seasons.length) currentSeasonIdx = 0;
    } else {
      throw new Error('Неверный формат');
    }
    
    const s = seasons[currentSeasonIdx];
    Object.keys(tournaments).forEach(k => delete tournaments[k]);
    tournamentOrder = [...(s.tournamentOrder || [])];
    for (const [k, v] of Object.entries(s.tournaments || {})) {
      tournaments[k] = normalizeTournament(v);
    }
    globalTeams = JSON.parse(JSON.stringify(s.globalTeams || []));
    globalTeams.forEach(t => { if (!t.flag) t.flag = ''; });
    
    fullRender();
    saveToLocalStorage();
    closeDataModal();
    showToast('✅ Данные импортированы');
  } catch (err) {
    showToast('❌ Ошибка: ' + err.message);
  }
}

function formatTeamLine(key, rank, teamEntry) {
  const t = tournaments[key];
  const globalTeam = getTeamById(teamEntry.teamId);
  if (!globalTeam) return '';
  const pts = calcPoints(key, teamEntry.w, teamEntry.d);
  const name = globalTeam.name || '???';
  const flag = t.isInternational && globalTeam.flag ? globalTeam.flag + ' ' : '';
  const base = `${rank}. ${flag}${name}: ${teamEntry.w} / ${teamEntry.d} / ${teamEntry.l} (${pts})`;
  if (globalTeam.isMe || !t.showH2H) return base;
  return `${base} [${teamEntry.h2h[0]} / ${teamEntry.h2h[1]} / ${teamEntry.h2h[2]}]`;
}

function formatPlayoffMatch(match, myName, myFlag, t) {
  const opponent = getTeamById(match.opponentTeamId);
  const opponentName = opponent ? opponent.name : '???';
  const opponentFlag = t.isInternational && opponent?.flag ? opponent.flag + ' ' : '';
  const myFlagStr = t.isInternational && myFlag ? myFlag + ' ' : '';
  const resultText = {
    'win': 'Победа', 'loss': 'Поражение',
    'draw': 'Ничья', 'scheduled': 'Запланировано'
  }[match.result] || '???';
  if (match.isHome) return `${match.round}. ${myFlagStr}${myName} — ${opponentFlag}${opponentName} (${resultText})`;
  return `${match.round}. ${opponentFlag}${opponentName} — ${myFlagStr}${myName} (${resultText})`;
}

function generate() {
  tournamentOrder.forEach(key => {
    tournaments[key].teams.sort((a, b) => calcPoints(key, b.w, b.d) - calcPoints(key, a.w, a.d));
  });
  
  const blocks = [];
  tournamentOrder.forEach(key => {
    const t = tournaments[key];
    if (!t || t.teams.length === 0) return;
    const my = getMyTeamInTournament(key);
    const myName = my ? my.globalTeam.name : '';
    const myFlag = my ? my.globalTeam.flag : '';
    let block = `${t.emoji} ${t.name}\n`;
    if (t.hasPlayoff && t.reachedPlayoff) block += 'Группа:\n';
    let teamsToDisplay = t.teams;
    if (t.displayLimit > 0) teamsToDisplay = t.teams.slice(0, t.displayLimit);
    teamsToDisplay.forEach((teamEntry, i) => {
      const line = formatTeamLine(key, i + 1, teamEntry);
      if (line) block += line + '\n';
    });
    if (t.hasPlayoff && t.reachedPlayoff && t.playoffMatches.length > 0) {
      block += '\nПлей-офф:\n';
      t.playoffMatches.forEach(match => { block += formatPlayoffMatch(match, myName, myFlag, t) + '\n'; });
    }
    const ranks = [];
    if (t.topScorer != null) ranks.push(`#${t.topScorer}`);
    if (t.topAssist != null) ranks.push(`#${t.topAssist}`);
    if (ranks.length > 0) block += `(${ranks.join(', ')})`;
    if (isTournamentFinished(key)) {
      block += `\n\n${buildSummaryText(key)}`;
    }
    blocks.push(block);
  });
  
  const allFinished = tournamentOrder.length > 0 && tournamentOrder.every(key => isTournamentFinished(key));
  
  if (allFinished) {
    let seasonTotal = { trophies: 0, goldenBoots: 0, matches: 0, goals: 0, assists: 0, mvp: 0, ratingSum: 0, ratingCount: 0 };
    tournamentOrder.forEach(key => {
      const t = tournaments[key];
      const achievement = getAchievement(key);
      if (achievement === 'Чемпионство') seasonTotal.trophies++;
      if (t.topScorer === 1) seasonTotal.goldenBoots++;
      seasonTotal.matches += getTotalMatches(key);
      seasonTotal.goals += t.summary.goals;
      seasonTotal.assists += t.summary.assists;
      seasonTotal.mvp += t.summary.mvp;
      if (t.summary.rating > 0) {
        seasonTotal.ratingSum += t.summary.rating;
        seasonTotal.ratingCount++;
      }
    });
    
    const seasonParts = [];
    if (seasonTotal.trophies > 0) seasonParts.push('🏆'.repeat(seasonTotal.trophies));
    if (seasonTotal.goldenBoots > 0) seasonParts.push('🏅'.repeat(seasonTotal.goldenBoots));
    seasonParts.push(`${seasonTotal.matches} матчей`);
    seasonParts.push(`${seasonTotal.goals} голов`);
    seasonParts.push(`${seasonTotal.assists} ассистов`);
    seasonParts.push(`${seasonTotal.mvp} МВП`);
    if (seasonTotal.ratingCount > 0) {
      const avgRating = (seasonTotal.ratingSum / seasonTotal.ratingCount).toFixed(1);
      seasonParts.push(`${avgRating} рейтинга`);
    }
    const seasonYear = seasons[currentSeasonIdx]?.year || '';
    blocks.push(`Итог сезона${seasonYear ? ' ' + seasonYear : ''}: ${seasonParts.join(', ')}`);
  }
  
  const output = document.getElementById('output');
  if (blocks.length === 0) {
    output.innerHTML = '<div class="empty">Добавь команды в турниры</div>';
  } else {
    output.textContent = blocks.join('\n\n');
  }
}

function copyOutput() {
  const text = document.getElementById('output').textContent;
  if (!text || text.includes('Нажми «Сгенерировать»')) {
    showToast('Сначала сгенерируй');
    return;
  }
  navigator.clipboard.writeText(text).then(() => showToast('Скопировано'))
    .catch(() => {
      const ta = document.createElement('textarea');
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      showToast('Скопировано');
    });
}

function showToast(msg) {
  const toast = document.getElementById('toast');
  toast.textContent = msg;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 2500);
}

function resetAll() {
  if (!confirm('Сбросить все данные и сезоны?')) return;
  localStorage.removeItem('tournamentApp_v4');
  const chunkCount = parseInt(getCookie('tournamentApp_c0') || '0', 10);
  for (let i = 0; i <= chunkCount; i++) deleteCookie('tournamentApp_c' + i);
  seasons = [];
  currentSeasonIdx = 0;
  initDefaults();
  seasons = [{
    year: 2025,
    tournamentOrder: [...tournamentOrder],
    tournaments: JSON.parse(JSON.stringify(tournaments)),
    globalTeams: JSON.parse(JSON.stringify(globalTeams))
  }];
  currentSeasonIdx = 0;
  fullRender();
  saveToLocalStorage();
  document.getElementById('output').innerHTML = '<div class="empty">Нажми «Сгенерировать»</div>';
  switchTab('settings');
}

function showGuide() {
  const guideHidden = getCookie('guide_hidden');
  const banner = document.getElementById('guide-banner');
  if (!guideHidden && banner) {
    banner.style.display = tournamentOrder.length === 0 ? 'block' : 'none';
  } else if (banner) {
    banner.style.display = 'none';
  }
}

function closeGuide() {
  setCookie('guide_hidden', '1', 365);
  document.getElementById('guide-banner').style.display = 'none';
}

function fullRender() {
  showGuide();
  renderTabs();
  renderPanels();
  tournamentOrder.forEach(k => { renderTopStats(k); renderTeams(k); });
  updateSeasonSelector();
  const activeTab = document.querySelector('#main-tabs .tab.active');
  if (activeTab) {
    switchTab(activeTab.dataset.tab);
  } else if (tournamentOrder.length > 0) {
    switchTab(tournamentOrder[0]);
  } else {
    switchTab('settings');
  }
}
