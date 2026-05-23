// Simple topbar implementation
let bar = null;

const defaults = {
  barColors: { 0: '#29d' },
  shadowColor: 'rgba(0, 0, 0, .3)'
};

const settings = { ...defaults };

const style = () => {
  const css = document.createElement('style');
  css.textContent = `#topbar { position: fixed; top: 0; left: 0; width: 100%; height: 2px; z-index: 9999; transition: height 0.3s; } #topbar .bar { background: linear-gradient(to right, ${Object.values(settings.barColors).join(', ')}); height: 2px; position: relative; } #topbar .peg { position: absolute; right: 0; width: 100px; height: 100%; box-shadow: 0 0 10px ${settings.shadowColor}, 0 0 5px ${settings.shadowColor}; opacity: 1; transform: rotate(3deg) translate(0px, -4px); }`;
  document.head.appendChild(css);
};

const render = (to) => {
  if (!bar) {
    bar = document.createElement('div');
    bar.id = 'topbar';
    bar.innerHTML = '<div class="bar"><div class="peg"></div></div>';
    document.body.appendChild(bar);
  }
  bar.style.width = to + '%';
};

export default {
  config: (opts) => Object.assign(settings, opts),
  show: (delay = 0) => {
    if (!bar) style();
    setTimeout(() => render(40), delay);
  },
  hide: () => {
    if (bar) {
      render(100);
      setTimeout(() => {
        if (bar && bar.parentNode) bar.parentNode.removeChild(bar);
        bar = null;
      }, 300);
    }
  }
};
