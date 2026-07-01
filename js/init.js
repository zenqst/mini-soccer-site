// ============ INIT ============
(async function init() {
  // Emergency: ?clear param wipes all storage and reloads
  if (checkUrlClearParam()) {
    location.reload();
    return;
  }

  let loaded = false;
  let loadSource = '';

  // 1. Try to migrate from cookies FIRST (before cleanup)
  //    This is the only chance to recover data from cookies
  if (!loaded) {
    try {
      const migrated = await migrateFromCookies();
      if (migrated) {
        const flagged = migrateFlags(migrated);
        applyData(flagged);
        loaded = true;
        loadSource = 'cookies (migrated to IndexedDB)';
      }
    } catch(e) { console.warn('Cookie migration failed', e); }
  }

  // 2. AGGRESSIVE: delete ALL old data cookies to prevent 502 errors
  aggressiveCookieCleanup();

  // 3. Try IndexedDB (primary storage after migration)
  if (!loaded) {
    try {
      const dbData = await dbLoad();
      if (dbData && dbData.seasons && dbData.seasons.length > 0) {
        const flagged = migrateFlags(dbData);
        applyData(flagged);
        loaded = true;
        loadSource = 'IndexedDB';
      }
    } catch(e) { console.warn('IndexedDB load failed', e); }
  }

  // 4. If still empty — try legacy localStorage
  if (!loaded) {
    try {
      const legacyData = await loadFromLocalStorageLegacy();
      if (legacyData) {
        applyData(legacyData);
        loaded = true;
        loadSource = 'localStorage (migrated)';
        syncCurrentSeason();
        await dbSave({ version: 5, seasons: JSON.parse(JSON.stringify(seasons)), currentSeasonIdx });
      }
    } catch(e) {}
  }

  // 5. Defaults
  if (!loaded) {
    initDefaults();
    seasons = [{
      year: 2025,
      tournamentOrder: [...tournamentOrder],
      tournaments: JSON.parse(JSON.stringify(tournaments)),
      globalTeams: JSON.parse(JSON.stringify(globalTeams))
    }];
    currentSeasonIdx = 0;
  }

  fullRender();
  await saveToDB();

  if (loadSource) {
    console.log('Data loaded from:', loadSource);
  }

  // Check for changelog update
  try {
    const lastSeen = localStorage.getItem('lastSeenVersion');
    if (lastSeen !== APP_VERSION && CHANGELOG.length > 0) {
      const latest = CHANGELOG[0];
      setTimeout(() => openChangelog(latest.version, latest.changes), 500);
    }
  } catch(e) {}

  window.addEventListener('error', function(e) {
    const banner = document.getElementById('guide-banner');
    if (banner) {
      banner.style.display = 'block';
      banner.querySelector('.guide-title').textContent = '\u26A0\uFE0F Ошибка при загрузке данных';
      banner.querySelector('.guide-steps').innerHTML =
        '<div class="guide-step"><span class="guide-step-num">!</span><span>Если сайт не работает, добавь <b>?clear</b> в адресную строку и нажми Enter — это очистит старые данные.</span></div>';
    }
  });

  document.getElementById('tournament-modal').addEventListener('click', (e) => { if (e.target.id === 'tournament-modal') closeModal(); });
  document.getElementById('data-modal').addEventListener('click', (e) => { if (e.target.id === 'data-modal') closeDataModal(); });
  document.getElementById('new-season-modal').addEventListener('click', (e) => { if (e.target.id === 'new-season-modal') closeNewSeasonModal(); });
  document.getElementById('flag-modal').addEventListener('click', (e) => { if (e.target.id === 'flag-modal') closeFlagModal(); });
  document.getElementById('presets-modal').addEventListener('click', (e) => { if (e.target.id === 'presets-modal') closePresetsModal(); });
  document.getElementById('team-manager-modal').addEventListener('click', (e) => { if (e.target.id === 'team-manager-modal') closeTeamManager(); });
  document.getElementById('quick-season-modal').addEventListener('click', (e) => { if (e.target.id === 'quick-season-modal') closeQuickSeasonModal(); });
  document.getElementById('changelog-modal').addEventListener('click', (e) => { if (e.target.id === 'changelog-modal') closeChangelog(); });
  window.addEventListener('beforeunload', () => { saveToDB(); });
})();
