import 'babel-polyfill';
import './styles.css';
import './lib/adaviz';
import vDDF from './vddf';

function injectResources() {
  let head = document.getElementsByTagName('head')[0];

  if (head) {
    let iconFont = document.createElement('link');
    iconFont.setAttribute('href', 'https://fonts.googleapis.com/icon?family=Material+Icons');
    iconFont.setAttribute('rel', 'stylesheet');

    head.appendChild(iconFont);
  }
}

function loadVDDF() {
  // TODO: this may not be compatible with old browsers

  let config = window.VDDF && window.VDDF.config ? window.VDDF.config : {};
  let elements = document.querySelectorAll('[data-vddf]');

  for (let i = 0; i < elements.length; i++) {
    const el = elements[i];
    const uri = el.getAttribute('data-vddf');

    if (!el.className.includes('vddf-chart')) {
      el.className = 'vddf-chart';
      let vddf = new vDDF(el, uri, config);
      vddf.render();
      el.__vddf__ = vddf;
    }
  }
}

if (document.readyState === 'complete') {
  loadVDDF();
} else {
  window.addEventListener('load', loadVDDF);
}

injectResources();
