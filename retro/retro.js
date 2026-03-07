/* ============================================================
   RETRO.JS v6 — Aditya Pandya
   Three radically distinct visual systems: NEON · TERMINAL · PRINT
   GSAP ScrollTrigger, noise canvas, VHS tracking,
   theme-aware particles, dramatic transitions
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {

  // ============================================================
  // THEME DEFINITIONS
  // ============================================================

  const THEMES = {
    neon: {
      label: 'NEON',
      colors: ['#A855F7','#00FF9F','#FF8906','#FF3E9D','#00CFFF','#FFE600'],
      rainDensity: 0.22,
      rainSpeedMult: 1.0,
      glitchInterval: [900, 2800],
      backdropStyle: 'orbit',
      cursorStyle: 'ascii',
      noiseOpacity: 0.035,
    },
    terminal: {
      label: 'TERMINAL',
      colors: ['#00FF41','#00CC33','#00AA28','#FFB000','#00FF41','#00DD36'],
      rainDensity: 0.5,
      rainSpeedMult: 2.0,
      glitchInterval: [1800, 4000],
      backdropStyle: 'pulse',
      cursorStyle: 'block',
      noiseOpacity: 0.06,
    },
    print: {
      label: 'PRINT',
      colors: ['#FF0066','#00AABB','#FFD600','#FF4400','#0077AA','#FF0066'],
      rainDensity: 0.08,
      rainSpeedMult: 0.4,
      glitchInterval: [600, 1800],
      backdropStyle: 'dots',
      cursorStyle: 'dots',
      noiseOpacity: 0.04,
    },
  };

  const THEME_ORDER = ['print', 'neon', 'terminal'];
  let currentTheme = 'print';

  function getTheme() { return THEMES[currentTheme]; }
  function getColors() { return getTheme().colors; }

  const CHARS = '01▓▒░█▄▀@#$+=><|\\/*%&^~`!ABCDabcd0123456789';


  // ============================================================
  // THEME SWITCHING
  // ============================================================

  function applyTheme(name, animate) {
    currentTheme = name;
    localStorage.setItem('retro-theme', name);

    if (name === 'neon') {
      document.body.removeAttribute('data-theme');
    } else {
      document.body.setAttribute('data-theme', name);
    }

    // Button shows what you'll get NEXT when you click
    const idx = THEME_ORDER.indexOf(name);
    const nextIdx = (idx + 1) % THEME_ORDER.length;
    const btnLabel = THEMES[THEME_ORDER[nextIdx]].label;
    document.querySelectorAll('.theme-toggle').forEach(btn => {
      btn.textContent = btnLabel;
    });

    const themeIndicator = document.getElementById('statusTheme');
    if (themeIndicator) themeIndicator.textContent = getTheme().label;

    if (animate) {
      document.body.classList.add('theme-switching');

      // Flash effect
      const flash = document.createElement('div');
      flash.style.cssText = 'position:fixed;inset:0;background:white;opacity:0.18;z-index:99999;pointer-events:none;transition:opacity 0.35s;';
      document.body.appendChild(flash);
      requestAnimationFrame(() => {
        requestAnimationFrame(() => { flash.style.opacity = '0'; });
      });
      setTimeout(() => { flash.remove(); document.body.classList.remove('theme-switching'); }, 450);

      // Glitch bars during transition
      for (let i = 0; i < 5; i++) {
        const bar = document.createElement('div');
        const top = Math.random() * 100;
        const h = 2 + Math.random() * 8;
        bar.style.cssText = `position:fixed;top:${top}%;left:0;right:0;height:${h}px;background:${getColors()[Math.floor(Math.random() * 6)]};opacity:0.5;z-index:99998;pointer-events:none;mix-blend-mode:screen;`;
        document.body.appendChild(bar);
        setTimeout(() => bar.remove(), 100 + Math.random() * 200);
      }
    }

    if (noiseCanvas) noiseCanvas.style.opacity = getTheme().noiseOpacity;
    if (heroCanvas) initHero();

    // Refresh GSAP ScrollTrigger after layout changes
    if (typeof ScrollTrigger !== 'undefined') {
      setTimeout(() => ScrollTrigger.refresh(), 100);
    }

    // Notify card effects to re-apply for new theme
    document.dispatchEvent(new CustomEvent('themeChanged', { detail: { theme: name } }));
  }

  function cycleTheme() {
    const idx = THEME_ORDER.indexOf(currentTheme);
    const nextIdx = (idx + 1) % THEME_ORDER.length;
    applyTheme(THEME_ORDER[nextIdx], true);
  }

  document.querySelectorAll('.theme-toggle').forEach(btn => {
    btn.addEventListener('click', cycleTheme);
  });


  // ============================================================
  // NOISE CANVAS — animated film grain overlay
  // ============================================================

  let noiseCanvas = document.getElementById('noise-canvas');
  if (!noiseCanvas) {
    noiseCanvas = document.createElement('canvas');
    noiseCanvas.id = 'noise-canvas';
    document.body.appendChild(noiseCanvas);
  }

  const noiseCtx = noiseCanvas.getContext('2d');
  noiseCanvas.width = 256;
  noiseCanvas.height = 256;

  function drawNoise() {
    const imgData = noiseCtx.createImageData(256, 256);
    const d = imgData.data;
    for (let i = 0; i < d.length; i += 4) {
      const v = Math.random() * 255;
      d[i] = d[i+1] = d[i+2] = v;
      d[i+3] = 255;
    }
    noiseCtx.putImageData(imgData, 0, 0);
  }
  setInterval(drawNoise, 80);
  drawNoise();


  // ============================================================
  // VHS TRACKING LINE
  // ============================================================

  const vhsLine = document.getElementById('vhs-line');
  let vhsY = -20, vhsSpeed = 0.8 + Math.random() * 1.2, vhsPause = 0;

  function animateVHS() {
    if (vhsLine) {
      if (vhsPause > 0) { vhsPause--; }
      else {
        vhsY += vhsSpeed;
        if (vhsY > window.innerHeight + 10) {
          vhsY = -20;
          vhsSpeed = 0.6 + Math.random() * 1.5;
          vhsPause = Math.floor(Math.random() * 120);
        }
      }
      vhsLine.style.top = vhsY + 'px';
    }
    requestAnimationFrame(animateVHS);
  }
  animateVHS();


  // ============================================================
  // ASCII CANVAS — Hero background (matrix rain + mouse ripple)
  // ============================================================

  const heroCanvas = document.getElementById('ascii-canvas');
  let heroCtx, heroCols, heroRows, cells = [], drops = [];
  let mouseX = -9999, mouseY = -9999;
  let frame = 0, animId = null;
  let heroVisible = true;

  if (heroCanvas) heroCtx = heroCanvas.getContext('2d');

  function initHero() {
    if (!heroCanvas) return;
    heroCanvas.width  = heroCanvas.offsetWidth  || window.innerWidth;
    heroCanvas.height = heroCanvas.offsetHeight || 800;
    heroCols = Math.ceil(heroCanvas.width  / 20);
    heroRows = Math.ceil(heroCanvas.height / 20);

    cells = [];
    for (let r = 0; r < heroRows; r++) {
      for (let c = 0; c < heroCols; c++) {
        cells.push({
          r, c,
          char: CHARS[Math.floor(Math.random() * CHARS.length)],
          colorIdx: Math.floor(Math.random() * getColors().length),
          baseAlpha: 0.04 + Math.random() * 0.11,
          phase: Math.random() * Math.PI * 2,
          speed: 0.007 + Math.random() * 0.013,
          changeTimer: Math.random() * 160,
          changeRate: 0.003 + Math.random() * 0.007,
        });
      }
    }

    drops = [];
    const dropCount = Math.floor(heroCols * getTheme().rainDensity);
    for (let i = 0; i < dropCount; i++) drops.push(makeRainDrop());
  }

  function makeRainDrop() {
    const speedMult = getTheme().rainSpeedMult;
    return {
      col: Math.floor(Math.random() * (heroCols || 40)),
      row: -Math.floor(Math.random() * 20),
      speed: (0.4 + Math.random() * 1.2) * speedMult,
      colorIdx: Math.floor(Math.random() * getColors().length),
      length: 6 + Math.floor(Math.random() * 12),
      timer: 0,
    };
  }

  function drawHero() {
    if (!heroCtx) return;
    frame++;
    const CS = 20;
    const colors = getColors();
    heroCtx.clearRect(0, 0, heroCanvas.width, heroCanvas.height);
    heroCtx.font = `${CS}px 'Share Tech Mono', monospace`;
    heroCtx.textBaseline = 'top';

    // Static ASCII field with mouse interaction
    for (const cell of cells) {
      const x = cell.c * CS, y = cell.r * CS;
      const dx = x + CS/2 - mouseX, dy = y + CS/2 - mouseY;
      const dist = Math.sqrt(dx*dx + dy*dy);
      const prox = Math.max(0, 1 - dist / 240);
      const pulse = (Math.sin(frame * cell.speed + cell.phase) + 1) / 2;
      const alpha = cell.baseAlpha + pulse * 0.07 + prox * 0.78;

      cell.changeTimer -= cell.changeRate * (1 + prox * 12);
      if (cell.changeTimer <= 0) {
        cell.char = CHARS[Math.floor(Math.random() * CHARS.length)];
        cell.changeTimer = 70 + Math.random() * 110;
        if (prox > 0.12) cell.colorIdx = Math.floor(Math.random() * colors.length);
      }

      const aHex = Math.min(255, Math.floor(alpha * 255)).toString(16).padStart(2, '0');
      heroCtx.fillStyle = colors[cell.colorIdx % colors.length] + aHex;
      heroCtx.fillText(cell.char, x, y);
    }

    // Rain drops
    for (const d of drops) {
      d.timer += d.speed;
      if (d.timer >= 1) { d.row++; d.timer = 0; }
      for (let i = 0; i < d.length; i++) {
        const row = d.row - i;
        if (row < 0 || row >= heroRows) continue;
        const x = d.col * CS, y = row * CS;
        const fade = i === 0 ? 1.0 : Math.max(0, 1 - i / d.length);
        const alpha = fade * (i === 0 ? 0.95 : 0.4);
        const c = i === 0 ? '#FFFFFF' : colors[d.colorIdx % colors.length];
        const aHex = Math.min(255, Math.floor(alpha * 255)).toString(16).padStart(2, '0');
        heroCtx.fillStyle = c + aHex;
        heroCtx.fillText(CHARS[Math.floor(Math.random() * CHARS.length)], x, y);
      }
      if (d.row - d.length > heroRows) {
        Object.assign(d, makeRainDrop());
        d.col = Math.floor(Math.random() * heroCols);
        d.row = -d.length;
      }
    }

    if (heroVisible) animId = requestAnimationFrame(drawHero);
  }

  const heroSection = document.getElementById('home');
  if (heroSection && heroCanvas) {
    const visObs = new IntersectionObserver((entries) => {
      heroVisible = entries[0].isIntersecting;
      if (heroVisible && !animId) { animId = null; drawHero(); }
    });
    visObs.observe(heroSection);

    window.addEventListener('mousemove', (e) => {
      const rect = heroCanvas.getBoundingClientRect();
      mouseX = e.clientX - rect.left;
      mouseY = e.clientY - rect.top;
    });

    window.addEventListener('resize', initHero);
    initHero();
    drawHero();
  }


  // ============================================================
  // HEX BACKDROP — animated canvas behind profile photo
  // ============================================================

  const hexBackdrop = document.getElementById('hex-backdrop');
  if (hexBackdrop) {
    const hctx = hexBackdrop.getContext('2d');
    let W, H;

    function resizeHexBackdrop() {
      W = hexBackdrop.offsetWidth || 340;
      H = hexBackdrop.offsetHeight || 340;
      hexBackdrop.width = W;
      hexBackdrop.height = H;
    }
    resizeHexBackdrop();
    window.addEventListener('resize', resizeHexBackdrop);

    const RING_COUNT = 42;
    const ringParticles = [];
    for (let i = 0; i < RING_COUNT; i++) {
      ringParticles.push({
        angle: (i / RING_COUNT) * Math.PI * 2,
        radius: 0.35 + Math.random() * 0.09, // normalized
        char: CHARS[Math.floor(Math.random() * CHARS.length)],
        colorIdx: Math.floor(Math.random() * 6),
        size: 10 + Math.random() * 10,
        speed: 0.003 + Math.random() * 0.005,
        wobble: Math.random() * Math.PI * 2,
        wobbleAmp: 0.02 + Math.random() * 0.04,
        wobbleSpeed: 0.01 + Math.random() * 0.02,
        changeTimer: Math.random() * 200,
      });
    }

    const GRID_COUNT = 24;
    const gridParticles = [];
    for (let i = 0; i < GRID_COUNT; i++) {
      const angle = Math.random() * Math.PI * 2;
      const r = 0.09 + Math.random() * 0.2;
      gridParticles.push({
        bx: Math.cos(angle) * r, by: Math.sin(angle) * r,
        char: CHARS[Math.floor(Math.random() * CHARS.length)],
        colorIdx: Math.floor(Math.random() * 6),
        size: 8 + Math.random() * 8,
        phase: Math.random() * Math.PI * 2,
        pulseSpeed: 0.02 + Math.random() * 0.03,
      });
    }

    const OUTER_COUNT = 20;
    const outerParticles = [];
    for (let i = 0; i < OUTER_COUNT; i++) {
      outerParticles.push({
        angle: (i / OUTER_COUNT) * Math.PI * 2 + Math.random() * 0.3,
        radius: 0.43 + Math.random() * 0.06,
        size: 6 + Math.random() * 5,
        speed: -(0.002 + Math.random() * 0.003),
        alpha: 0.1 + Math.random() * 0.15,
        colorIdx: Math.floor(Math.random() * 6),
      });
    }

    let hexFrame = 0;

    function drawHexBackdrop() {
      hexFrame++;
      hctx.clearRect(0, 0, W, H);
      const colors = getColors();
      const cx = W / 2, cy = H / 2;
      const scale = Math.min(W, H);
      const style = getTheme().backdropStyle;
      hctx.textBaseline = 'middle';
      hctx.textAlign = 'center';

      if (style === 'orbit') {
        // Outer chromatic particles
        for (const p of outerParticles) {
          p.angle += p.speed;
          const r = p.radius * scale;
          const x = cx + Math.cos(p.angle) * r;
          const y = cy + Math.sin(p.angle) * r;
          const aHex = Math.floor(p.alpha * 255).toString(16).padStart(2, '0');
          hctx.font = `${p.size}px 'Share Tech Mono', monospace`;
          hctx.fillStyle = 'rgba(255,0,100,' + (p.alpha * 0.5) + ')';
          hctx.fillText('·', x - 2, y - 1);
          hctx.fillStyle = 'rgba(0,200,255,' + (p.alpha * 0.5) + ')';
          hctx.fillText('·', x + 2, y + 1);
          hctx.fillStyle = colors[p.colorIdx % colors.length] + aHex;
          hctx.fillText('·', x, y);
        }
        // Main orbiting characters
        for (const p of ringParticles) {
          p.angle += p.speed;
          p.wobble += p.wobbleSpeed;
          const r = (p.radius + Math.sin(p.wobble) * p.wobbleAmp) * scale;
          const x = cx + Math.cos(p.angle) * r;
          const y = cy + Math.sin(p.angle) * r;
          const pulse = (Math.sin(hexFrame * 0.03 + p.wobble) + 1) / 2;
          const alpha = 0.2 + pulse * 0.6;
          p.changeTimer--;
          if (p.changeTimer <= 0) {
            p.char = CHARS[Math.floor(Math.random() * CHARS.length)];
            p.changeTimer = 60 + Math.random() * 120;
            p.colorIdx = Math.floor(Math.random() * colors.length);
          }
          hctx.font = `${p.size}px 'Share Tech Mono', monospace`;
          const aHex = Math.floor(alpha * 255).toString(16).padStart(2, '0');
          hctx.fillStyle = 'rgba(255,0,100,' + (alpha * 0.3) + ')';
          hctx.fillText(p.char, x - 2, y - 1);
          hctx.fillStyle = 'rgba(0,200,255,' + (alpha * 0.3) + ')';
          hctx.fillText(p.char, x + 2, y + 1);
          hctx.fillStyle = colors[p.colorIdx % colors.length] + aHex;
          hctx.fillText(p.char, x, y);
        }
      }

      if (style === 'pulse') {
        // Green phosphor pulse
        for (const p of ringParticles) {
          p.angle += p.speed * 0.7;
          p.wobble += p.wobbleSpeed;
          const r = (p.radius + Math.sin(p.wobble) * p.wobbleAmp * 0.5) * scale;
          const x = cx + Math.cos(p.angle) * r;
          const y = cy + Math.sin(p.angle) * r;
          const pulse = (Math.sin(hexFrame * 0.025 + p.wobble) + 1) / 2;
          const alpha = 0.1 + pulse * 0.45;
          p.changeTimer--;
          if (p.changeTimer <= 0) {
            p.char = CHARS[Math.floor(Math.random() * CHARS.length)];
            p.changeTimer = 100 + Math.random() * 180;
          }
          hctx.font = `${p.size}px 'Share Tech Mono', monospace`;
          const aHex = Math.floor(alpha * 255).toString(16).padStart(2, '0');
          hctx.fillStyle = 'rgba(0,255,65,' + (alpha * 0.15) + ')';
          hctx.fillText(p.char, x, y);
          hctx.fillStyle = '#00FF41' + aHex;
          hctx.fillText(p.char, x, y);
        }
        for (const g of gridParticles) {
          g.phase += g.pulseSpeed;
          const pulse = (Math.sin(g.phase) + 1) / 2;
          const alpha = pulse * 0.55;
          const sz = g.size * (0.8 + pulse * 0.5);
          hctx.font = `${sz}px 'Share Tech Mono', monospace`;
          const aHex = Math.floor(alpha * 255).toString(16).padStart(2, '0');
          hctx.fillStyle = '#00FF41' + aHex;
          hctx.fillText(g.char, cx + g.bx * scale, cy + g.by * scale);
        }
        // Scan line
        const scanY = cy + Math.sin(hexFrame * 0.02) * (scale * 0.23);
        hctx.strokeStyle = 'rgba(0,255,65,0.12)';
        hctx.lineWidth = 2;
        hctx.beginPath();
        hctx.moveTo(cx - scale * 0.38, scanY);
        hctx.lineTo(cx + scale * 0.38, scanY);
        hctx.stroke();
      }

      if (style === 'dots') {
        // Halftone dot grid
        const DOT_GRID = 16;
        const cols = Math.ceil(W / DOT_GRID);
        const rows = Math.ceil(H / DOT_GRID);
        for (let r = 0; r < rows; r++) {
          for (let c = 0; c < cols; c++) {
            const x = c * DOT_GRID + DOT_GRID / 2;
            const y = r * DOT_GRID + DOT_GRID / 2;
            const dist = Math.sqrt((x - cx) ** 2 + (y - cy) ** 2);
            if (dist < scale * 0.22 || dist > scale * 0.47) continue;
            const wave = Math.sin(hexFrame * 0.025 + dist * 0.04);
            const radius = 1.5 + wave * 4;
            const alpha = 0.15 + ((wave + 1) / 2) * 0.45;
            const colorIdx = (r + c + Math.floor(hexFrame / 30)) % colors.length;
            hctx.globalAlpha = alpha * 0.3;
            hctx.fillStyle = '#FF0066';
            hctx.beginPath(); hctx.arc(x - 1.5, y - 1, Math.max(0.5, radius * 0.8), 0, Math.PI * 2); hctx.fill();
            hctx.fillStyle = '#00AABB';
            hctx.beginPath(); hctx.arc(x + 1.5, y + 1, Math.max(0.5, radius * 0.8), 0, Math.PI * 2); hctx.fill();
            hctx.globalAlpha = alpha;
            hctx.fillStyle = colors[colorIdx];
            hctx.beginPath(); hctx.arc(x, y, Math.max(0.5, radius), 0, Math.PI * 2); hctx.fill();
          }
        }
        hctx.globalAlpha = 1;
        // Faint orbiting chars
        for (const p of ringParticles) {
          p.angle += p.speed * 0.3;
          p.wobble += p.wobbleSpeed;
          const r = (p.radius + Math.sin(p.wobble) * p.wobbleAmp * 0.3) * scale;
          const x = cx + Math.cos(p.angle) * r;
          const y = cy + Math.sin(p.angle) * r;
          const alpha = 0.06 + (Math.sin(hexFrame * 0.02 + p.wobble) + 1) / 2 * 0.12;
          p.changeTimer--;
          if (p.changeTimer <= 0) { p.char = CHARS[Math.floor(Math.random() * CHARS.length)]; p.changeTimer = 80 + Math.random() * 150; }
          hctx.font = `${p.size * 0.6}px 'Share Tech Mono', monospace`;
          const aHex = Math.floor(alpha * 255).toString(16).padStart(2, '0');
          hctx.fillStyle = colors[p.colorIdx % colors.length] + aHex;
          hctx.fillText(p.char, x, y);
        }
      }

      requestAnimationFrame(drawHexBackdrop);
    }
    drawHexBackdrop();
  }


  // ============================================================
  // CURSOR TRAIL — theme-aware particles
  // ============================================================

  (function initCursorTrail() {
    const canvas = document.createElement('canvas');
    canvas.style.cssText = 'position:fixed;inset:0;pointer-events:none;z-index:9993;';
    document.body.appendChild(canvas);
    const ctx = canvas.getContext('2d');
    let particles = [];
    let lastX = 0, lastY = 0;

    function resize() { canvas.width = window.innerWidth; canvas.height = window.innerHeight; }
    resize();
    window.addEventListener('resize', resize);

    window.addEventListener('mousemove', (e) => {
      const dx = e.clientX - lastX, dy = e.clientY - lastY;
      const speed = Math.sqrt(dx*dx + dy*dy);
      lastX = e.clientX; lastY = e.clientY;
      const colors = getColors();
      const style = getTheme().cursorStyle;
      const count = Math.min(Math.ceil(speed / 7) + 1, 5);

      for (let i = 0; i < count; i++) {
        const p = {
          x: e.clientX + (Math.random() - 0.5) * 8,
          y: e.clientY + (Math.random() - 0.5) * 8,
          color: colors[Math.floor(Math.random() * colors.length)],
          alpha: 0.85 + Math.random() * 0.15,
          vx: (Math.random() - 0.5) * 2.8,
          vy: (Math.random() - 0.5) * 2.8 - 0.8,
          decay: 0.055 + Math.random() * 0.04,
          style: style,
        };
        if (style === 'ascii') {
          p.char = CHARS[Math.floor(Math.random() * CHARS.length)];
          p.size = 11 + Math.random() * 11;
        } else if (style === 'block') {
          p.size = 6 + Math.random() * 8;
          p.color = '#00FF41';
          p.vy = (Math.random() - 0.5) * 1.5;
          p.vx = (Math.random() - 0.5) * 1.5;
          p.decay = 0.08 + Math.random() * 0.04;
        } else if (style === 'dots') {
          p.radius = 3 + Math.random() * 6;
          p.decay = 0.06 + Math.random() * 0.03;
          p.vy = (Math.random() - 0.5) * 1.2;
        }
        particles.push(p);
      }
    });

    function animTrail() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.alpha -= p.decay;
        if (p.alpha <= 0) { particles.splice(i, 1); continue; }
        p.x += p.vx; p.y += p.vy;

        if (p.style === 'ascii') {
          p.vy += 0.08;
          ctx.font = `${p.size}px 'Share Tech Mono', monospace`;
          ctx.textBaseline = 'top';
          ctx.fillStyle = 'rgba(255,0,100,' + (p.alpha * 0.25) + ')';
          ctx.fillText(p.char, p.x - 1.5, p.y - 1);
          ctx.fillStyle = 'rgba(0,200,255,' + (p.alpha * 0.25) + ')';
          ctx.fillText(p.char, p.x + 1.5, p.y + 1);
          ctx.fillStyle = p.color + Math.floor(p.alpha * 255).toString(16).padStart(2, '0');
          ctx.fillText(p.char, p.x, p.y);
        } else if (p.style === 'block') {
          p.vy += 0.12;
          const a = Math.floor(p.alpha * 255).toString(16).padStart(2, '0');
          ctx.shadowColor = '#00FF41'; ctx.shadowBlur = 8;
          ctx.fillStyle = '#00FF41' + a;
          ctx.fillRect(p.x, p.y, p.size, p.size);
          ctx.shadowBlur = 0;
        } else if (p.style === 'dots') {
          p.vy += 0.06;
          const r = p.radius * p.alpha;
          ctx.beginPath();
          ctx.arc(p.x, p.y, Math.max(0.5, r), 0, Math.PI * 2);
          ctx.fillStyle = p.color + Math.floor(p.alpha * 255).toString(16).padStart(2, '0');
          ctx.fill();
        }
      }
      requestAnimationFrame(animTrail);
    }
    animTrail();
  })();


  // ============================================================
  // THEME-SPECIFIC CARD INTERACTIONS
  // Each theme gets a completely different hover behavior
  // ============================================================

  // Detect touch device (disable hover effects on mobile)
  const isTouchDevice = ('ontouchstart' in window) || navigator.maxTouchPoints > 0;

  if (!isTouchDevice) {

    // ── NEON: Magnetic Warp + Chromatic Split ──
    // Cards magnetically attract toward cursor with inner content
    // shifting at a different rate (parallax depth). On hover,
    // a chromatic aberration CSS effect splits the card visually.
    function initNeonCardEffect(card) {
      let rafId = null;
      let targetX = 0, targetY = 0, curX = 0, curY = 0;

      const onEnter = () => { card.classList.add('neon-hover-active'); };

      const onMove = (e) => {
        const rect = card.getBoundingClientRect();
        const mx = e.clientX - rect.left;
        const my = e.clientY - rect.top;
        const hw = rect.width / 2;
        const hh = rect.height / 2;
        const nx = (mx - hw) / hw;
        const ny = (my - hh) / hh;
        targetX = nx;
        targetY = ny;

        if (!rafId) {
          rafId = requestAnimationFrame(function animate() {
            curX += (targetX - curX) * 0.15;
            curY += (targetY - curY) * 0.15;
            const pullX = curX * 12;
            const pullY = curY * 8;
            card.style.transform = `translate(${pullX}px, ${pullY}px) scale(1.02)`;
            const inner = card.querySelector('.card-content') || card.querySelector('.card-body');
            if (inner) inner.style.transform = `translate(${-curX * 6}px, ${-curY * 4}px)`;
            card.style.setProperty('--chroma-x', (curX * 3).toFixed(1) + 'px');
            card.style.setProperty('--chroma-y', (curY * 2).toFixed(1) + 'px');
            if (Math.abs(targetX - curX) > 0.001 || Math.abs(targetY - curY) > 0.001) {
              rafId = requestAnimationFrame(animate);
            } else { rafId = null; }
          });
        }
      };

      const onLeave = () => {
        card.classList.remove('neon-hover-active');
        targetX = 0; targetY = 0;
        function resetAnim() {
          curX += (0 - curX) * 0.12;
          curY += (0 - curY) * 0.12;
          card.style.transform = `translate(${curX * 12}px, ${curY * 8}px) scale(${1 + Math.abs(curX) * 0.02})`;
          const inner = card.querySelector('.card-content') || card.querySelector('.card-body');
          if (inner) inner.style.transform = `translate(${-curX * 6}px, ${-curY * 4}px)`;
          card.style.setProperty('--chroma-x', (curX * 3).toFixed(1) + 'px');
          card.style.setProperty('--chroma-y', (curY * 2).toFixed(1) + 'px');
          if (Math.abs(curX) > 0.005 || Math.abs(curY) > 0.005) {
            requestAnimationFrame(resetAnim);
          } else {
            card.style.transform = '';
            if (inner) inner.style.transform = '';
            card.style.setProperty('--chroma-x', '0px');
            card.style.setProperty('--chroma-y', '0px');
            rafId = null;
          }
        }
        if (rafId) { cancelAnimationFrame(rafId); rafId = null; }
        requestAnimationFrame(resetAnim);
      };

      card.addEventListener('mouseenter', onEnter);
      card.addEventListener('mousemove', onMove);
      card.addEventListener('mouseleave', onLeave);
      return { mouseenter: onEnter, mousemove: onMove, mouseleave: onLeave };
    }

    // ── TERMINAL: Glitch Corruption + Text Scramble ──
    // On hover, text briefly scrambles into random characters,
    // the card border flickers, and a horizontal "tear" line
    // slices across the card. Very CRT-failure aesthetic.
    function initTerminalCardEffect(card) {
      let scrambleTimer = null;
      const glitchChars = '░▒▓█▄▀┃┫┣╋╳╬╠╣╦╩01?!@#$%';

      const onEnter = () => {
        card.classList.add('term-glitch-active');

        // Text scramble effect on title
        const title = card.querySelector('.card-title') || card.querySelector('h3');
        if (title && !title._origText) {
          title._origText = title.textContent;
          let iterations = 0;
          const orig = title._origText;
          scrambleTimer = setInterval(() => {
            title.textContent = orig.split('').map((ch, i) => {
              if (i < iterations) return orig[i];
              return glitchChars[Math.floor(Math.random() * glitchChars.length)];
            }).join('');
            iterations += 1.5;
            if (iterations >= orig.length) {
              title.textContent = orig;
              clearInterval(scrambleTimer);
              scrambleTimer = null;
            }
          }, 35);
        }

        // Horizontal tear line
        const tear = document.createElement('div');
        tear.className = 'term-tear-line';
        tear.style.cssText = `position:absolute;left:0;right:0;height:2px;background:rgba(0,255,65,0.6);box-shadow:0 0 8px rgba(0,255,65,0.4),0 0 20px rgba(0,255,65,0.2);z-index:10;pointer-events:none;top:${Math.random()*80+10}%;animation:termTearSweep 0.4s ease-out forwards;`;
        card.appendChild(tear);
        setTimeout(() => tear.remove(), 500);
      };

      const onMove = (e) => {
        // Subtle CRT tracking jitter
        card.style.transform = `translateX(${(Math.random() - 0.5) * 1.2}px)`;
      };

      const onLeave = () => {
        card.classList.remove('term-glitch-active');
        card.style.transform = '';
        const title = card.querySelector('.card-title') || card.querySelector('h3');
        if (title && title._origText) {
          title.textContent = title._origText;
          delete title._origText;
        }
        if (scrambleTimer) { clearInterval(scrambleTimer); scrambleTimer = null; }
      };

      card.addEventListener('mouseenter', onEnter);
      card.addEventListener('mousemove', onMove);
      card.addEventListener('mouseleave', onLeave);
      return { mouseenter: onEnter, mousemove: onMove, mouseleave: onLeave };
    }

    // ── PRINT: Paper Lift + Shadow Grow ──
    // Cards lift off the page with growing drop shadow underneath,
    // plus a subtle rotation based on which edge the cursor entered.
    function initPrintCardEffect(card) {
      const onEnter = (e) => {
        const rect = card.getBoundingClientRect();
        const mx = e.clientX - rect.left;
        const my = e.clientY - rect.top;
        const fromLeft = mx / rect.width;
        const fromTop = my / rect.height;
        let rotDeg = 0;
        if (fromLeft < 0.3) rotDeg = 0.8;
        else if (fromLeft > 0.7) rotDeg = -0.8;
        if (fromTop < 0.3) rotDeg += 0.5;
        else if (fromTop > 0.7) rotDeg -= 0.5;

        card.style.transition = 'transform 0.35s cubic-bezier(0.23, 1, 0.32, 1), box-shadow 0.35s cubic-bezier(0.23, 1, 0.32, 1)';
        card.style.transform = `translateY(-8px) rotate(${rotDeg}deg)`;
        card.style.boxShadow = `${rotDeg * 2}px 16px 0 rgba(0,0,0,0.85)`;
      };

      const onLeave = () => {
        card.style.transition = 'transform 0.4s cubic-bezier(0.23, 1, 0.32, 1), box-shadow 0.4s cubic-bezier(0.23, 1, 0.32, 1)';
        card.style.transform = '';
        card.style.boxShadow = '';
      };

      card.addEventListener('mouseenter', onEnter);
      card.addEventListener('mouseleave', onLeave);
      return { mouseenter: onEnter, mouseleave: onLeave };
    }

    // ── Apply theme-specific effects ──
    // Track active cleanup functions per card
    const cardCleanups = new WeakMap();

    function applyCardEffects() {
      document.querySelectorAll('.card, .philosophy-card').forEach(card => {
        // Clean up previous effect
        const cleanup = cardCleanups.get(card);
        if (cleanup) cleanup();

        // Reset inline styles from previous theme
        card.style.transform = '';
        card.style.boxShadow = '';
        card.style.transition = '';
        card.classList.remove('neon-hover-active', 'term-glitch-active');
        const inner = card.querySelector('.card-content') || card.querySelector('.card-body');
        if (inner) inner.style.transform = '';

        // Apply the right effect
        let handlers = {};
        if (currentTheme === 'neon') {
          handlers = initNeonCardEffect(card);
        } else if (currentTheme === 'terminal') {
          handlers = initTerminalCardEffect(card);
        } else if (currentTheme === 'print') {
          handlers = initPrintCardEffect(card);
        }

        // Store cleanup
        cardCleanups.set(card, () => {
          if (handlers.mouseenter) card.removeEventListener('mouseenter', handlers.mouseenter);
          if (handlers.mousemove) card.removeEventListener('mousemove', handlers.mousemove);
          if (handlers.mouseleave) card.removeEventListener('mouseleave', handlers.mouseleave);
        });
      });
    }

    // Apply on load
    applyCardEffects();

    // Re-apply when theme changes
    document.addEventListener('themeChanged', () => {
      setTimeout(applyCardEffects, 150);
    });
  }


  // ============================================================
  // GSAP SCROLL ANIMATIONS
  // ============================================================

  if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger);

    // Hero entrance
    const heroTl = gsap.timeline({ defaults: { ease: 'power3.out' } });
    heroTl
      .from('.hex-wrapper', { scale: 0.6, opacity: 0, duration: 1.2, delay: 0.2 })
      .from('.header-intro', { x: -40, opacity: 0, duration: 0.7 }, '-=0.6')
      .from('.name-title', { y: 30, opacity: 0, duration: 0.8 }, '-=0.4')
      .from('.header-subtitle', { y: 20, opacity: 0, duration: 0.6 }, '-=0.3');

    // Parallax hex on scroll
    gsap.to('.hex-wrapper', {
      y: 80,
      scrollTrigger: {
        trigger: '#home',
        start: 'top top',
        end: 'bottom top',
        scrub: 1,
      }
    });

    // Section headings
    gsap.utils.toArray('.section-heading').forEach(heading => {
      gsap.from(heading, {
        x: -60, opacity: 0, duration: 0.9,
        scrollTrigger: { trigger: heading, start: 'top 85%', toggleActions: 'play none none none' }
      });
    });

    // Philosophy cards
    gsap.from('.philosophy-card', {
      y: 60, opacity: 0, duration: 0.7, stagger: 0.15,
      scrollTrigger: { trigger: '.philosophy-cards', start: 'top 80%', toggleActions: 'play none none none' }
    });

    // Achievement cards
    gsap.from('.grid .card', {
      y: 50, opacity: 0, rotateX: 8, duration: 0.7, stagger: 0.12,
      scrollTrigger: { trigger: '.grid', start: 'top 80%', toggleActions: 'play none none none' }
    });

    // Mission
    gsap.from('.accent-content', {
      scale: 0.9, opacity: 0, duration: 1,
      scrollTrigger: { trigger: '.accent-section', start: 'top 75%', toggleActions: 'play none none none' }
    });

    // Tags
    gsap.from('.contact-tags .tag', {
      x: -30, opacity: 0, duration: 0.5, stagger: 0.1,
      scrollTrigger: { trigger: '.contact-tags', start: 'top 85%', toggleActions: 'play none none none' }
    });

    // Contact form
    gsap.from('.contact-form', {
      y: 40, opacity: 0, duration: 0.8,
      scrollTrigger: { trigger: '.contact-form', start: 'top 85%', toggleActions: 'play none none none' }
    });

    // Highlight box
    gsap.from('.highlight-box', {
      x: -40, opacity: 0, duration: 0.8,
      scrollTrigger: { trigger: '.highlight-box', start: 'top 85%', toggleActions: 'play none none none' }
    });

    // About paragraphs
    gsap.from('.about-content p', {
      y: 25, opacity: 0, duration: 0.6, stagger: 0.08,
      scrollTrigger: { trigger: '.about-content', start: 'top 80%', toggleActions: 'play none none none' }
    });
  }


  // ============================================================
  // GLITCH
  // ============================================================

  document.querySelectorAll('.glitch').forEach(el => {
    el.setAttribute('data-text', el.textContent);
  });

  function randomGlitch() {
    const targets = document.querySelectorAll('.section-heading, .name-title, .card-title');
    const visible = Array.from(targets).filter(el => {
      const r = el.getBoundingClientRect();
      return r.top < window.innerHeight && r.bottom > 0;
    });
    if (visible.length) {
      const el = visible[Math.floor(Math.random() * visible.length)];
      el.classList.add('glitching');
      setTimeout(() => el.classList.remove('glitching'), 220);
    }
    const [min, range] = getTheme().glitchInterval;
    setTimeout(randomGlitch, min + Math.random() * range);
  }
  randomGlitch();


  // ============================================================
  // TYPING ANIMATION
  // ============================================================

  const subtitleEl = document.querySelector('.header-subtitle');
  if (subtitleEl) {
    const fullText = subtitleEl.textContent.trim();
    subtitleEl.textContent = '';
    const cursor = document.createElement('span');
    cursor.className = 'typing-cursor';
    subtitleEl.after(cursor);
    let i = 0;
    setTimeout(() => {
      const timer = setInterval(() => {
        if (i < fullText.length) subtitleEl.textContent += fullText[i++];
        else clearInterval(timer);
      }, 22);
    }, 800);
  }


  // ============================================================
  // PROGRESS BAR + NAV + STATUS BAR
  // ============================================================

  const progressBar = document.getElementById('progressBar');
  const statusSection = document.getElementById('statusSection');
  const sections = [
    { id: 'home', label: 'HOME' },
    { id: 'about', label: 'ABOUT' },
    { id: 'philosophy', label: 'PHILOSOPHY' },
    { id: 'achievements', label: 'ACHIEVEMENTS' },
    { id: 'contact', label: 'CONTACT' },
  ];

  function onScroll() {
    const scrolled = document.documentElement.scrollTop;
    const total = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    if (progressBar) progressBar.style.width = (scrolled / total * 100) + '%';

    let current = 'HOME';
    sections.forEach(s => {
      const el = document.getElementById(s.id);
      if (el && window.pageYOffset >= el.offsetTop - 320) current = s.label;
    });
    if (statusSection) statusSection.textContent = current;

    document.querySelectorAll('.nav-link').forEach(link => {
      link.classList.remove('active');
      const sec = sections.find(s => s.label === current);
      if (sec && link.getAttribute('href')?.includes(sec.id === 'home' ? '#' : sec.id)) {
        link.classList.add('active');
      }
    });
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();


  // ============================================================
  // STATUS BAR — live clock
  // ============================================================

  const statusTime = document.getElementById('statusTime');
  function updateClock() {
    if (statusTime) statusTime.textContent = new Date().toTimeString().slice(0, 8);
    setTimeout(updateClock, 1000);
  }
  updateClock();


  // ============================================================
  // ASCII DIVIDERS
  // ============================================================

  document.querySelectorAll('.ascii-divider').forEach(el => {
    const glyphs = ['─','═','━','▪','·','+','=','-','>','<','|','░','▒'];
    const count = Math.ceil(window.innerWidth / 9);
    el.textContent = Array.from({ length: count }, (_,i) => glyphs[i % glyphs.length] + ' ').join('');
  });


  // ============================================================
  // MOBILE MENU
  // ============================================================

  const mobileToggle = document.querySelector('.mobile-menu-toggle');
  const navLinks = document.querySelector('.nav-links');

  if (mobileToggle && navLinks) {
    const icon = mobileToggle.querySelector('.mobile-menu-glyph');
    mobileToggle.addEventListener('click', (e) => {
      e.stopPropagation();
      const open = navLinks.classList.toggle('active');
      if (icon) icon.textContent = open ? 'CLOSE' : 'MENU';
    });
    document.addEventListener('click', (e) => {
      if (navLinks.classList.contains('active') && !navLinks.contains(e.target) && e.target !== mobileToggle) {
        navLinks.classList.remove('active');
        if (icon) icon.textContent = 'MENU';
      }
    });
  }


  // ============================================================
  // EASTER EGGS & DELIGHTFUL DETAILS
  // ============================================================

  // ── 1. KONAMI CODE: triggers a full-page party mode ──
  const konamiSeq = [38,38,40,40,37,39,37,39,66,65]; // ↑↑↓↓←→←→BA
  let konamiIdx = 0;
  document.addEventListener('keydown', (e) => {
    if (e.keyCode === konamiSeq[konamiIdx]) {
      konamiIdx++;
      if (konamiIdx === konamiSeq.length) {
        konamiIdx = 0;
        activatePartyMode();
      }
    } else { konamiIdx = 0; }
  });

  function activatePartyMode() {
    document.body.style.transition = 'none';
    let hue = 0;
    const partyInterval = setInterval(() => {
      hue = (hue + 8) % 360;
      document.body.style.filter = `hue-rotate(${hue}deg)`;
    }, 50);
    // Confetti burst
    for (let i = 0; i < 60; i++) {
      const confetti = document.createElement('div');
      const size = 6 + Math.random() * 10;
      const colors = ['#FF0066','#00CFFF','#A855F7','#00FF9F','#FFE600','#FF8906'];
      confetti.style.cssText = `
        position:fixed;
        left:${Math.random()*100}vw;
        top:-20px;
        width:${size}px;
        height:${size * (0.5 + Math.random())}px;
        background:${colors[Math.floor(Math.random()*colors.length)]};
        z-index:99999;
        pointer-events:none;
        transform:rotate(${Math.random()*360}deg);
        animation:confettiFall ${2+Math.random()*3}s ease-in forwards;
        animation-delay:${Math.random()*0.5}s;
      `;
      document.body.appendChild(confetti);
      setTimeout(() => confetti.remove(), 5000);
    }
    // Inject keyframe if not present
    if (!document.getElementById('confetti-style')) {
      const style = document.createElement('style');
      style.id = 'confetti-style';
      style.textContent = `
        @keyframes confettiFall {
          0% { transform: translateY(0) rotate(0deg); opacity: 1; }
          100% { transform: translateY(110vh) rotate(${360 + Math.random()*720}deg); opacity: 0; }
        }
      `;
      document.head.appendChild(style);
    }
    setTimeout(() => {
      clearInterval(partyInterval);
      document.body.style.filter = '';
      document.body.style.transition = '';
    }, 5000);
  }

  // ── 2. SECRET CLICK on nav logo: rapid theme roulette ──
  const navLogo = document.querySelector('.nav-logo');
  let logoClickCount = 0;
  let logoClickTimer = null;
  let logoRouletteActive = false;
  if (navLogo) {
    navLogo.addEventListener('click', (e) => {
      e.preventDefault();
      if (logoRouletteActive) return;
      logoClickCount++;
      if (logoClickTimer) clearTimeout(logoClickTimer);
      logoClickTimer = setTimeout(() => { logoClickCount = 0; }, 500);

      if (logoClickCount >= 5) {
        logoClickCount = 0;
        logoRouletteActive = true;

        // Retro-only logo roulette: never exits to the classic site.
        let spins = 0;
        const maxSpins = 22;
        let rouletteTheme = currentTheme;

        const spinRoulette = () => {
          rouletteTheme = THEME_ORDER[(THEME_ORDER.indexOf(rouletteTheme) + 1) % THEME_ORDER.length];
          applyTheme(rouletteTheme, true);
          spins++;

          if (spins < maxSpins) {
            const delay = 120 + (spins * 35);
            setTimeout(spinRoulette, delay);
            return;
          }

          logoRouletteActive = false;
        };

        spinRoulette();
      }
    });
  }

  // ── 3. NEON: Double-click anywhere spawns an ASCII explosion ──
  document.addEventListener('dblclick', (e) => {
    if (currentTheme !== 'neon') return;
    const chars = '★✦✧⚡♦◆●▲■◗☆✶✴❖';
    const colors = getColors();
    for (let i = 0; i < 18; i++) {
      const spark = document.createElement('div');
      const angle = (i / 18) * Math.PI * 2;
      const dist = 60 + Math.random() * 100;
      const ch = chars[Math.floor(Math.random() * chars.length)];
      spark.textContent = ch;
      spark.style.cssText = `
        position:fixed;
        left:${e.clientX}px;
        top:${e.clientY}px;
        color:${colors[Math.floor(Math.random()*colors.length)]};
        font-size:${14+Math.random()*18}px;
        font-family:'Share Tech Mono',monospace;
        pointer-events:none;
        z-index:99999;
        text-shadow:0 0 8px currentColor;
        transition:all 0.7s cubic-bezier(0.23,1,0.32,1);
        opacity:1;
      `;
      document.body.appendChild(spark);
      requestAnimationFrame(() => {
        spark.style.transform = `translate(${Math.cos(angle)*dist}px, ${Math.sin(angle)*dist}px) scale(0.3) rotate(${Math.random()*360}deg)`;
        spark.style.opacity = '0';
      });
      setTimeout(() => spark.remove(), 800);
    }
  });

  // ── 4. TERMINAL: Type "hack" anywhere to trigger fake hack sequence ──
  let hackBuffer = '';
  document.addEventListener('keypress', (e) => {
    if (currentTheme !== 'terminal') return;
    hackBuffer += e.key.toLowerCase();
    if (hackBuffer.length > 10) hackBuffer = hackBuffer.slice(-10);
    if (hackBuffer.endsWith('hack')) {
      hackBuffer = '';
      runFakeHack();
    }
  });

  function runFakeHack() {
    const overlay = document.createElement('div');
    overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,8,0,0.95);z-index:99999;padding:40px;font-family:"Share Tech Mono",monospace;color:#00FF41;font-size:13px;overflow:hidden;pointer-events:none;';
    document.body.appendChild(overlay);

    const lines = [
      '> INITIATING SECURITY BYPASS...',
      '> SCANNING NETWORK INTERFACES... eth0: UP',
      '> DECRYPTING PAYLOAD... [████████████████] 100%',
      '> ACCESSING MAINFRAME... GRANTED',
      '> DOWNLOADING classified_files.tar.gz... 2.4GB',
      '> WARNING: FIREWALL DETECTED... BYPASSING...',
      '> INJECTING SHELL CODE... SUCCESS',
      '> .',
      '> ..',
      '> ...',
      '> JUST KIDDING. 😄',
      '> This is Aditya\'s portfolio, not the Pentagon.',
      '> ACCESS STATUS: YOU\'RE WELCOME HERE',
      '',
      '> [Press any key or wait to exit]',
    ];

    let lineIdx = 0;
    function addLine() {
      if (lineIdx < lines.length) {
        const p = document.createElement('div');
        p.textContent = lines[lineIdx];
        p.style.textShadow = '0 0 10px #00FF41';
        p.style.marginBottom = '4px';
        overlay.appendChild(p);
        lineIdx++;
        setTimeout(addLine, 150 + Math.random() * 200);
      }
    }
    addLine();

    function dismiss() {
      overlay.style.transition = 'opacity 0.5s';
      overlay.style.opacity = '0';
      setTimeout(() => overlay.remove(), 600);
      document.removeEventListener('keydown', dismiss);
    }
    setTimeout(() => document.addEventListener('keydown', dismiss, { once: true }), 2000);
    setTimeout(dismiss, 8000);
  }

  // ── 5. PRINT: Hover on the footer copyright for a fun "colophon" tooltip ──
  const copyright = document.querySelector('.copyright');
  if (copyright) {
    const tip = document.createElement('div');
    tip.className = 'print-colophon-tip';
    tip.innerHTML = 'Set in Bebas Neue & Space Mono<br>Printed on organic CSS<br>Edition: 1 of 1<br>No trees were harmed 🌿';
    tip.style.cssText = `
      position:absolute;bottom:100%;left:0;
      background:#000;color:#fff;
      padding:12px 16px;font-size:0.7rem;
      line-height:1.6;white-space:nowrap;
      pointer-events:none;opacity:0;
      transition:opacity 0.3s,transform 0.3s;
      transform:translateY(8px);
      font-family:'Space Mono',monospace;
      border:2px solid #FF0066;
      display:none;
      z-index:9999;
    `;
    copyright.style.position = 'relative';
    copyright.appendChild(tip);
    copyright.addEventListener('mouseenter', () => {
      if (currentTheme !== 'print') return;
      tip.style.display = 'block';
      requestAnimationFrame(() => {
        tip.style.opacity = '1';
        tip.style.transform = 'translateY(0)';
      });
    });
    copyright.addEventListener('mouseleave', () => {
      tip.style.opacity = '0';
      tip.style.transform = 'translateY(8px)';
      setTimeout(() => { tip.style.display = 'none'; }, 300);
    });
  }

  // ── 6. STATUS BAR: Live uptime counter + secret click ──
  const statusMsg = document.querySelector('.status-msg');
  if (statusMsg) {
    const startTime = Date.now();
    setInterval(() => {
      const elapsed = Math.floor((Date.now() - startTime) / 1000);
      const m = Math.floor(elapsed / 60);
      const s = elapsed % 60;
      const pad = (n) => String(n).padStart(2, '0');

      if (currentTheme === 'terminal') {
        statusMsg.textContent = `UPTIME: ${pad(m)}:${pad(s)} // PID: ${Math.floor(Math.random()*9000+1000)}`;
      } else if (currentTheme === 'print') {
        statusMsg.textContent = `PAGE ${Math.ceil((document.documentElement.scrollTop + 1) / window.innerHeight)} OF ${Math.ceil(document.documentElement.scrollHeight / window.innerHeight)}`;
      } else {
        statusMsg.textContent = `SESSION: ${pad(m)}:${pad(s)} // UPLINK ACTIVE`;
      }
    }, 1000);
  }

  // ── 7. NEON: Hex photo reacts to click with a pulse wave ──
  const hexWrapper = document.querySelector('.hex-wrapper');
  if (hexWrapper) {
    hexWrapper.addEventListener('click', () => {
      if (currentTheme !== 'neon') return;
      hexWrapper.style.transition = 'transform 0.15s ease-out';
      hexWrapper.style.transform = 'scale(1.12)';
      // Flash the ring
      const ring = hexWrapper;
      ring.style.filter = 'brightness(2) drop-shadow(0 0 40px #A855F7)';
      setTimeout(() => {
        hexWrapper.style.transition = 'transform 0.6s cubic-bezier(0.23,1,0.32,1)';
        hexWrapper.style.transform = '';
        ring.style.filter = '';
      }, 200);
    });
  }

  // ── 8. TERMINAL: Cursor blinks faster when near the hex photo ──
  if (hexWrapper) {
    hexWrapper.addEventListener('mouseenter', () => {
      if (currentTheme !== 'terminal') return;
      const cursor = document.querySelector('.typing-cursor');
      if (cursor) cursor.style.animationDuration = '0.3s';
    });
    hexWrapper.addEventListener('mouseleave', () => {
      const cursor = document.querySelector('.typing-cursor');
      if (cursor) cursor.style.animationDuration = '';
    });
  }

  // ── 9. PRINT: Section number badges appear on scroll ──
  if (typeof IntersectionObserver !== 'undefined') {
    const sectionMap = { about: '01', philosophy: '02', achievements: '03', contact: '04' };
    document.querySelectorAll('.section').forEach(sec => {
      const num = sectionMap[sec.id];
      if (!num) return;
      const badge = document.createElement('div');
      badge.className = 'print-section-badge';
      badge.textContent = num;
      badge.style.cssText = `
        position:absolute;top:24px;right:24px;
        font-family:'Bebas Neue',sans-serif;
        font-size:5rem;color:rgba(0,0,0,0.04);
        line-height:1;pointer-events:none;
        transition:opacity 0.6s,transform 0.6s;
        opacity:0;transform:translateY(20px);
        display:none;
      `;
      sec.style.position = 'relative';
      sec.appendChild(badge);

      const obs = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (currentTheme === 'print') {
            badge.style.display = 'block';
            if (entry.isIntersecting) {
              badge.style.opacity = '1';
              badge.style.transform = 'translateY(0)';
            } else {
              badge.style.opacity = '0';
              badge.style.transform = 'translateY(20px)';
            }
          } else {
            badge.style.display = 'none';
          }
        });
      }, { threshold: 0.15 });
      obs.observe(sec);
    });
  }

  // ── 10. ALL THEMES: Console ASCII art ──
  console.log('%c' + [
    '╔══════════════════════════════════════════╗',
    '║     _    ____    ____  _____ _____ ____  ║',
    '║    / \\  |  _ \\  |  _ \\| ____|_   _|  _ \\ ║',
    '║   / _ \\ | |_) | | |_) |  _|   | | | |_) |║',
    '║  / ___ \\|  __/  |  _ <| |___  | | |  _ < ║',
    '║ /_/   \\_\\_|     |_| \\_\\_____| |_| |_| \\_\\║',
    '║                                          ║',
    '║  👋 Hey curious one! Like the source?    ║',
    '║  Built with ♥ by Aditya Pandya           ║',
    '║  Try: Konami code, type "hack" in        ║',
    '║  terminal mode, or 5x-click the logo!    ║',
    '╚══════════════════════════════════════════╝',
  ].join('\n'), 'color:#A855F7;font-family:monospace;font-size:12px;');


  // ============================================================
  // INIT
  // ============================================================

  applyTheme(currentTheme, false);

});
