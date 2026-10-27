// 设置页四个分区可以收起/展开；最后加载，只包一层，不动里面的控件和事件
(() => {
  const KEY = 'between-settings-open';
  const sections = [...document.querySelectorAll('#settings-view .settings-section')];
  if (!sections.length) return;
  const hints = ['文字 · 气泡 · 行距 · 过渡', '称呼头像 · 发送键 · 草稿', '模型 · 共同记忆', '备份 · 导入 · 整理'];
  let open;
  try { open = JSON.parse(localStorage.getItem(KEY) || 'null'); } catch {}
  if (!Array.isArray(open)) open = sections.map((_, i) => i === 0);
  const save = () => { try { localStorage.setItem(KEY, JSON.stringify(open)); } catch {} };
  const G = window.gsap;
  sections.forEach((sec, i) => {
    const h = sec.querySelector('h2');
    const body = document.createElement('div');
    body.className = 'settings-body';
    body.id = 'settings-body-' + (i + 1);
    while (h.nextSibling) body.append(h.nextSibling);
    sec.append(body);
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'settings-fold';
    btn.setAttribute('aria-controls', body.id);
    btn.append(...h.childNodes);
    btn.insertAdjacentHTML('beforeend', `<small class="fold-hint">${hints[i] || ''}</small><i class="fold-mark" aria-hidden="true"></i>`);
    h.append(btn);
    const set = (on, animate) => {
      open[i] = on;
      sec.classList.toggle('is-open', on);
      btn.setAttribute('aria-expanded', String(on));
      body.inert = !on;
      if (!animate || !G || !motionAllowed()) { body.style.height = on ? '' : '0px'; return; }
      G.killTweensOf(body);
      if (on) G.fromTo(body, { height: 0 }, { height: 'auto', duration: .42, ease: 'power2.out', clearProps: 'height' });
      else G.fromTo(body, { height: body.offsetHeight }, { height: 0, duration: .32, ease: 'power2.inOut' });
    };
    set(!!open[i], false);
    btn.addEventListener('click', () => { set(!open[i], true); save(); });
  });
})();
