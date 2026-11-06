/**
 * Pickleball Scorer - Official Website JavaScript
 * Pure Vanilla JavaScript + Bootstrap 5.3 Features
 */

document.addEventListener('DOMContentLoaded', () => {
  initSplashScreen();
  initThemeToggle();
  initScoreSimulator();
  initCheckoutModal();
  initBackToTop();
});

/* -------------------------------------------------------------
   1. SPLASH SCREEN (App-identical loading & replay)
   ------------------------------------------------------------- */
function initSplashScreen() {
  const splash = document.getElementById('splash-screen');
  const replayBtn = document.getElementById('btn-replay-splash');

  // Automatically hide splash after 1.5 seconds
  setTimeout(() => {
    hideSplash();
  }, 1500);

  if (replayBtn) {
    replayBtn.addEventListener('click', () => {
      showSplash();
      setTimeout(() => {
        hideSplash();
      }, 1500);
    });
  }

  function showSplash() {
    if (!splash) return;
    splash.classList.remove('splash-hidden');
    const bar = splash.querySelector('.splash-progress-bar');
    if (bar) {
      bar.style.animation = 'none';
      bar.offsetHeight; /* trigger reflow */
      bar.style.animation = 'splashFill 1.5s ease-in-out forwards';
    }
  }

  function hideSplash() {
    if (!splash) return;
    splash.classList.add('splash-hidden');
  }
}

/* -------------------------------------------------------------
   2. DARK / LIGHT THEME TOGGLE
   ------------------------------------------------------------- */
function initThemeToggle() {
  const toggleBtn = document.getElementById('theme-toggle-btn');
  const themeIcon = document.getElementById('theme-toggle-icon');
  const html = document.documentElement;

  // Retrieve saved theme or default to dark
  const savedTheme = localStorage.getItem('pickleball_web_theme') || 'dark';
  applyTheme(savedTheme);

  if (toggleBtn) {
    toggleBtn.addEventListener('click', () => {
      const currentTheme = html.getAttribute('data-bs-theme');
      const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
      applyTheme(newTheme);
      localStorage.setItem('pickleball_web_theme', newTheme);
    });
  }

  function applyTheme(theme) {
    html.setAttribute('data-bs-theme', theme);
    if (themeIcon) {
      if (theme === 'dark') {
        themeIcon.className = 'bi bi-sun-fill text-warning';
      } else {
        themeIcon.className = 'bi bi-moon-stars-fill text-primary';
      }
    }
  }
}

/* -------------------------------------------------------------
   3. INTERACTIVE COURT SCOREBOARD SIMULATOR
   ------------------------------------------------------------- */
function initScoreSimulator() {
  let team1Score = 0;
  let team2Score = 0;
  let serverNumber = 2; // Pickleball starts on 0-0-2!
  let servingTeam = 1;  // 1 or 2
  let serverSide = 'R';  // R (Even) or L (Odd)

  const calloutElem = document.getElementById('sim-callout-text');
  const serverBadgeElem = document.getElementById('sim-server-badge');
  const team1Badge = document.getElementById('sim-team1-pts');
  const team2Badge = document.getElementById('sim-team2-pts');
  const courtP1 = document.getElementById('sim-p1-token');
  const courtP2 = document.getElementById('sim-p2-token');
  const statusLog = document.getElementById('sim-status-log');

  const btnPoint = document.getElementById('sim-btn-point');
  const btnFault = document.getElementById('sim-btn-fault');
  const btnReset = document.getElementById('sim-btn-reset');

  if (!btnPoint || !btnFault || !btnReset) return;

  function updateDisplay(eventMsg) {
    // 3-Number Callout: [Serving Team Score] - [Receiving Team Score] - [Server #]
    const servingScore = servingTeam === 1 ? team1Score : team2Score;
    const receivingScore = servingTeam === 1 ? team2Score : team1Score;
    
    if (calloutElem) {
      calloutElem.textContent = `${servingScore} - ${receivingScore} - ${serverNumber}`;
    }

    if (team1Badge) team1Badge.textContent = `${team1Score} pts`;
    if (team2Badge) team2Badge.textContent = `${team2Score} pts`;

    if (serverBadgeElem) {
      serverBadgeElem.textContent = `Team ${servingTeam} Serving (${serverSide === 'R' ? 'Right / Even Court' : 'Left / Odd Court'})`;
      serverBadgeElem.className = servingTeam === 1 
        ? 'badge bg-info text-dark fw-bold' 
        : 'badge bg-warning text-dark fw-bold';
    }

    if (statusLog && eventMsg) {
      statusLog.textContent = eventMsg;
    }

    // Check game won condition (11 points, win by 2)
    if (team1Score >= 11 && team1Score - team2Score >= 2) {
      if (statusLog) statusLog.textContent = '🏆 Team 1 (Cyan) Wins the Game!';
    } else if (team2Score >= 11 && team2Score - team1Score >= 2) {
      if (statusLog) statusLog.textContent = '🏆 Team 2 (Orange) Wins the Game!';
    }
  }

  // Point scored by serving team
  btnPoint.addEventListener('click', () => {
    if (servingTeam === 1) {
      team1Score++;
    } else {
      team2Score++;
    }
    // Switch serving sides (Right <-> Left)
    serverSide = serverSide === 'R' ? 'L' : 'R';
    updateDisplay(`Point for Team ${servingTeam}! Server switched to ${serverSide === 'R' ? 'Right' : 'Left'} court.`);
  });

  // Fault committed by serving team
  btnFault.addEventListener('click', () => {
    if (team1Score === 0 && team2Score === 0 && serverNumber === 2 && servingTeam === 1) {
      // First service fault on 0-0-2 -> Immediate Side Out!
      servingTeam = 2;
      serverNumber = 1;
      serverSide = 'R';
      updateDisplay('Side Out! Opening server fault transitions serve directly to Team 2.');
    } else if (serverNumber === 1) {
      // Server 1 faulted -> Second Server takes over
      serverNumber = 2;
      // Server 2 serves from position based on score even/odd
      const currentScore = servingTeam === 1 ? team1Score : team2Score;
      serverSide = (currentScore % 2 === 0) ? 'R' : 'L';
      updateDisplay(`Fault on Server 1! Server 2 takes over serve for Team ${servingTeam}.`);
    } else {
      // Server 2 faulted -> Side Out to other team
      servingTeam = servingTeam === 1 ? 2 : 1;
      serverNumber = 1;
      const nextScore = servingTeam === 1 ? team1Score : team2Score;
      serverSide = (nextScore % 2 === 0) ? 'R' : 'L';
      updateDisplay(`Side Out! Service turns over to Team ${servingTeam} (Server 1).`);
    }
  });

  // Reset simulator
  btnReset.addEventListener('click', () => {
    team1Score = 0;
    team2Score = 0;
    serverNumber = 2;
    servingTeam = 1;
    serverSide = 'R';
    updateDisplay('Reset to opening score: 0-0-2. Team 1 on Right court.');
  });

  updateDisplay('Game ready. Press "Serving Point" or "Fault / Side-Out".');
}

/* -------------------------------------------------------------
   4. CHECKOUT MODAL & PRICING PURCHASE FLOW
   ------------------------------------------------------------- */
function initCheckoutModal() {
  const modalElem = document.getElementById('checkoutModal');
  const planTitleElem = document.getElementById('checkout-plan-title');
  const planPriceElem = document.getElementById('checkout-plan-price');
  const licenseBox = document.getElementById('checkout-license-result');
  const keyOutput = document.getElementById('generated-license-key');
  const checkoutBtn = document.getElementById('btn-confirm-purchase');

  if (!modalElem) return;

  // Listen for buttons triggering the modal
  document.querySelectorAll('[data-plan-name]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const planName = btn.getAttribute('data-plan-name');
      const planPrice = btn.getAttribute('data-plan-price');
      if (planTitleElem) planTitleElem.textContent = planName;
      if (planPriceElem) planPriceElem.textContent = planPrice;
      if (licenseBox) licenseBox.classList.add('d-none');
    });
  });

  if (checkoutBtn) {
    checkoutBtn.addEventListener('click', () => {
      // Generate instant sample license key
      const randomSegments = [
        'PKBL',
        Math.random().toString(36).substring(2, 6).toUpperCase(),
        Math.random().toString(36).substring(2, 6).toUpperCase(),
        '2026'
      ];
      const key = randomSegments.join('-');
      if (keyOutput) keyOutput.textContent = key;
      if (licenseBox) licenseBox.classList.remove('d-none');
    });
  }
}

/* -------------------------------------------------------------
   5. BACK TO TOP BUTTON
   ------------------------------------------------------------- */
function initBackToTop() {
  const backToTop = document.getElementById('btn-back-to-top');
  if (!backToTop) return;

  window.addEventListener('scroll', () => {
    if (window.scrollY > 400) {
      backToTop.style.display = 'flex';
    } else {
      backToTop.style.display = 'none';
    }
  });

  backToTop.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}
