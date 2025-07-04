// src/pages/home.ts
import '../styles/home.css';
import i18next from 'i18next';

export function renderHome(): HTMLElement {
  const container = document.createElement('div');

  const userData = localStorage.getItem('user');
  const user = userData ? JSON.parse(userData) : null;

  container.innerHTML = `
    <div class="home-wrapper">
      <div class="home-container">
        <header class="home-header">
          <h1 class="home-title">${i18next.t('welcome')}</h1>
          <div class="header-right">
            <div class="dropdown">
              <button class="dropdown-toggle" id="dropdownToggle">
                <span class="user-icon">${i18next.t('profile')}</span>
              </button>
              <div class="dropdown-menu" id="dropdownMenu" style="display: none;">
                <button class="dropdown-item" id="profileBtn">⚙️ ${i18next.t('profile')}</button>
                <button class="dropdown-item" id="logoutBtn">🚪 ${i18next.t('logout')}</button>
              </div>
            </div>
            <select id="langSelect" class="language-selector">
              <option value="en">EN</option>
              <option value="fr">FR</option>
              <option value="ar">AR</option>
            </select>
          </div>
        </header>
        ${user ? `<h2 class="welcome-msg">${i18next.t('hello')} <span class="username">${user.name}</span>!</h2>` : ''}
        <main class="home-main">
          <div class="game-mode-cards">
            <div class="game-card">
              <h2>🎯 1v1 Game</h2>
              <p>${i18next.t('startMatch')}</p>
              <button class="action-btn" id="playBtn">▶️ ${i18next.t('startMatch')}</button>
              <form id="playerForm" class="player-form" style="display: none;">
                <div class="form-group">
                  <label for="player2">${i18next.t('enterSecondPlayer')}</label>
                  <input type="text" id="player2" class="player-input" placeholder="${i18next.t('player2Name')}" required />
                </div>
                <div class="form-buttons">
                  <button type="submit" class="start-game-btn">🎮 ${i18next.t('startGame')}</button>
                  <button type="button" class="cancel-btn" id="cancelBtn">❌ ${i18next.t('cancel')}</button>
                </div>
              </form>
            </div>
            <div class="game-card">
              <h2>🏆 ${i18next.t('tournament')}</h2>
              <p>${i18next.t('joinTournament')}</p>
              <button class="action-btn" id="tournamentBtn">🚀 ${i18next.t('tournament')}</button>
            </div>
          </div>
        </main>
      </div>
    </div>
  `;

  // Elements
  const dropdownToggle = container.querySelector('#dropdownToggle')!;
  const dropdownMenu = container.querySelector('#dropdownMenu')!;
  const logoutBtn = container.querySelector('#logoutBtn');
  const profileBtn = container.querySelector('#profileBtn');
  const playBtn = container.querySelector('#playBtn');
  const tournamentBtn = container.querySelector('#tournamentBtn');
  const form = container.querySelector('#playerForm') as HTMLFormElement;
  const input = container.querySelector('#player2') as HTMLInputElement;
  const cancelBtn = container.querySelector('#cancelBtn');
  const langSelect = container.querySelector('#langSelect') as HTMLSelectElement;

  // Language selector
  langSelect.value = i18next.language;
  langSelect.addEventListener('change', (e) => {
    const newLang = (e.target as HTMLSelectElement).value;
    i18next.changeLanguage(newLang).then(() => location.reload());
  });

  // Dropdown toggle
  dropdownToggle.addEventListener('click', () => {
    (dropdownMenu  as HTMLElement).style.display= (dropdownMenu  as HTMLElement).style.display === 'block' ? 'none' : 'block';
  });

  // Logout
  if (logoutBtn) {
    logoutBtn.addEventListener('click', async () => {
      try {
        await fetch('https://localhost:3000/api/logout', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token') || ''}`
          }
        });
      } catch (err) {
        console.error('Logout API failed:', err);
      }
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      location.hash = '/login';
    });
  }

  // Profile
  if (profileBtn) {
    profileBtn.addEventListener('click', () => {
      location.hash = '/profile';
    });
  }

  // 1v1 Play button
  if (playBtn) {
    playBtn.addEventListener('click', () => {
      form.style.display = 'block';
      input.focus();
    });
  }

  // Cancel form
  if (cancelBtn) {
    cancelBtn.addEventListener('click', () => {
      form.style.display = 'none';
      input.value = '';
    });
  }

  // Submit form
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const player2Name = input.value.trim();
      if (player2Name) {
        const gameData = {
          player1: user?.name || 'Player 1',
          player2: player2Name
        };
        localStorage.setItem('gameData', JSON.stringify(gameData));
        location.hash = '/pong';
      }
    });
  }

  // Tournament
  if (tournamentBtn) {
    tournamentBtn.addEventListener('click', () => {
      location.hash = '/tournament';
    });
  }

  return container;
}
