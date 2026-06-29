// ============ INIT ============
const loaded = loadFromLocalStorage();
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
saveToLocalStorage();

document.getElementById('tournament-modal').addEventListener('click', (e) => { if (e.target.id === 'tournament-modal') closeModal(); });
document.getElementById('data-modal').addEventListener('click', (e) => { if (e.target.id === 'data-modal') closeDataModal(); });
document.getElementById('new-season-modal').addEventListener('click', (e) => { if (e.target.id === 'new-season-modal') closeNewSeasonModal(); });
document.getElementById('flag-modal').addEventListener('click', (e) => { if (e.target.id === 'flag-modal') closeFlagModal(); });
document.getElementById('presets-modal').addEventListener('click', (e) => { if (e.target.id === 'presets-modal') closePresetsModal(); });
document.getElementById('team-manager-modal').addEventListener('click', (e) => { if (e.target.id === 'team-manager-modal') closeTeamManager(); });
document.getElementById('quick-season-modal').addEventListener('click', (e) => { if (e.target.id === 'quick-season-modal') closeQuickSeasonModal(); });
window.addEventListener('beforeunload', saveToLocalStorage);