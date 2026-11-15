  const tabs = document.querySelectorAll('nav.tabs button');
  const panels = document.querySelectorAll('.panel');

  function activate(tabName) {
    const btn = [...tabs].find(t => t.dataset.tab === tabName);
    tabs.forEach(t => t.classList.toggle('active', t === btn));
    panels.forEach(p => p.classList.toggle('active', p.id === tabName));
    animatePanel(document.getElementById(tabName));
  }
  tabs.forEach(t => t.addEventListener('click', () => activate(t.dataset.tab)));

  function countUp(el) {
    const target = parseInt(el.dataset.count, 10);
    const suffix = el.dataset.suffix || '';
    const dur = 1000;
    const start = performance.now();
    function tick(now) {
      const p = Math.min(1, (now - start) / dur);
      const eased = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(target * eased).toLocaleString() + suffix;
      if (p < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }

  function animateBarGroup(rows) {
    rows.forEach((row, i) => {
      row.classList.remove('show');
      row.querySelectorAll('.bar-fill, .cmp-bar-fill, .div-fill').forEach(f => f.style.width = '0');
      setTimeout(() => {
        row.classList.add('show');
        row.querySelectorAll('.bar-fill, .cmp-bar-fill, .div-fill').forEach(f => { f.style.width = f.dataset.width + '%'; });
      }, i * 80);
    });
  }

  function animatePanel(panel) {
    if (!panel) return;
    panel.querySelectorAll('[data-count]').forEach(el => { el.textContent = '0' + (el.dataset.suffix || ''); countUp(el); });

    if (panel.id === 'scores') {
      const visibleRows = document.getElementById('overallBars').style.display === 'none'
        ? [...document.getElementById('compareBars').querySelectorAll('[data-factor]')]
        : [...document.getElementById('overallBars').querySelectorAll('[data-factor]')];
      animateBarGroup(visibleRows);
    } else {
      animateBarGroup([...panel.querySelectorAll('[data-factor]')]);
    }

    const donutSvg = panel.querySelector('#donutSvg');
    if (donutSvg) {
      donutSvg.style.opacity = '0'; donutSvg.style.transform = 'scale(.85)';
      requestAnimationFrame(() => requestAnimationFrame(() => { donutSvg.style.opacity = '1'; donutSvg.style.transform = 'scale(1)'; }));
    }

    const regRing = panel.querySelector('#regRing');
    if (regRing) {
      regRing.style.transition = 'none';
      regRing.setAttribute('stroke-dashoffset', 402);
      requestAnimationFrame(() => requestAnimationFrame(() => {
        regRing.style.transition = 'stroke-dashoffset 1.2s var(--ease)';
        regRing.setAttribute('stroke-dashoffset', 402 - regRing.dataset.target);
      }));
    }
  }

  const scoreModeBtns = document.querySelectorAll('#scoreMode button');
  const overallBars = document.getElementById('overallBars');
  const compareBars = document.getElementById('compareBars');
  const scoresExplain = document.getElementById('scoresExplain');
  scoreModeBtns.forEach(btn => btn.addEventListener('click', () => {
    scoreModeBtns.forEach(b => b.classList.toggle('active', b === btn));
    if (btn.dataset.mode === 'overall') {
      overallBars.style.display = ''; compareBars.style.display = 'none';
      scoresExplain.textContent = 'Each bar shows how students scored, on average, for one soft-skill factor. Higher bars mean evaluators rated students more favorably on that trait overall.';
      animateBarGroup([...overallBars.querySelectorAll('[data-factor]')]);
    } else {
      overallBars.style.display = 'none'; compareBars.style.display = '';
      scoresExplain.textContent = 'Each factor now shows two bars: the average score among students rated Employable, versus those rated Less Employable. A bigger gap suggests that factor separates the two groups more clearly.';
      animateBarGroup([...compareBars.querySelectorAll('[data-factor]')]);
    }
  }));

  document.getElementById('exportBtn').addEventListener('click', () => {
    const activePanel = document.querySelector('.panel.active');
    const tabName = document.querySelector('nav.tabs button.active').dataset.tab;
    html2canvas(activePanel, { backgroundColor: '#faf8f5', scale: 2 }).then(canvas => {
      const link = document.createElement('a');
      link.download = 'dashboard-' + tabName + '.png';
      link.href = canvas.toDataURL('image/png');
      link.click();
    });
  });

  window.addEventListener('load', () => animatePanel(document.getElementById('overview')));
