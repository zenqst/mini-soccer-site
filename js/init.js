// ============ INIT ============
(async function init() {
  // Emergency: ?clear param wipes all storage and reloads
  if (checkUrlClearParam()) {
    location.reload();
    return;
  }

  let loaded = false;
  let loadSource = '';

  // 1. Try IndexedDB (primary storage)
  try {
    const dbData = await dbLoad();
    if (dbData && dbData.seasons && dbData.seasons.length > 0) {
      const migrated = migrateFlags(dbData);
      applyData(migrated);
      loaded = true;
      loadSource = 'IndexedDB';
    }
  } catch(e) { console.warn('IndexedDB load failed', e); }

  // 2. If empty — migrate from cookies
  if (!loaded) {
    try {
      const migrated = await migrateFromCookies();
      if (migrated) {
        const flagged = migrateFlags(migrated);
        applyData(flagged);
        loaded = true;
        loadSource = 'cookies (migrated)';
      }
    } catch(e) { console.warn('Cookie migration failed', e); }
  }

  // 3. If still empty — try legacy localStorage
  if (!loaded) {
    try {
      const legacyData = await loadFromLocalStorageLegacy();
      if (legacyData) {
        applyData(legacyData);
        loaded = true;
        loadSource = 'localStorage (migrated)';
        syncCurrentSeason();
        await dbSave({ version: 5, seasons: JSON.parse(JSON.stringify(seasons)), currentSeasonIdx });
        clearAllStorage();
      }
    } catch(e) {}
  }

  // 4. Defaults
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

  // Show recovery notice if data was migrated
  if (loadSource) {
    console.log('Data loaded from:', loadSource);
  }

  // Global error handler — show a banner if something goes wrong
  window.addEventListener('error', function(e) {
    const banner = document.getElementById('guide-banner');
    if (banner) {
      banner.style.display = 'block';
      banner.querySelector('.guide-title').textContent = '⚠️ Произошла ошибка при загрузке данных';
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
  window.addEventListener('beforeunload', () => { saveToDB(); });
})();
