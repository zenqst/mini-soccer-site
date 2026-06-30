// ============ INIT ============
(async function init() {
  let loaded = false;

  // 1. Try IndexedDB (primary storage)
  try {
    const dbData = await dbLoad();
    if (dbData && dbData.seasons && dbData.seasons.length > 0) {
      const migrated = migrateFlags(dbData);
      applyData(migrated);
      loaded = true;
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
        // Migrate to IndexedDB
        syncCurrentSeason();
        await dbSave({ version: 5, seasons: JSON.parse(JSON.stringify(seasons)), currentSeasonIdx });
        localStorage.removeItem('tournamentApp_v4');
        localStorage.removeItem('tournamentApp_v3');
        localStorage.removeItem('tournamentApp_v2');
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

  document.getElementById('tournament-modal').addEventListener('click', (e) => { if (e.target.id === 'tournament-modal') closeModal(); });
  document.getElementById('data-modal').addEventListener('click', (e) => { if (e.target.id === 'data-modal') closeDataModal(); });
  document.getElementById('new-season-modal').addEventListener('click', (e) => { if (e.target.id === 'new-season-modal') closeNewSeasonModal(); });
  document.getElementById('flag-modal').addEventListener('click', (e) => { if (e.target.id === 'flag-modal') closeFlagModal(); });
  document.getElementById('presets-modal').addEventListener('click', (e) => { if (e.target.id === 'presets-modal') closePresetsModal(); });
  document.getElementById('team-manager-modal').addEventListener('click', (e) => { if (e.target.id === 'team-manager-modal') closeTeamManager(); });
  document.getElementById('quick-season-modal').addEventListener('click', (e) => { if (e.target.id === 'quick-season-modal') closeQuickSeasonModal(); });
  window.addEventListener('beforeunload', () => { saveToDB(); });
})();
