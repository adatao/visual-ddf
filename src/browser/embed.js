import 'babel-polyfill';
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

window.addEventListener('load', () => {
  // TODO: this may not be compatible with old browsers

  let elements = document.querySelectorAll('[data-vddf]');

  for (let i = 0; i < elements.length; i++) {
    const el = elements[i];
    const uri = el.getAttribute('data-vddf');

    if (!el.className.includes('vddf-chart')) {
      el.className = 'vddf-chart';
      let vddf = new vDDF(el, uri);
      vddf.render();
      el.__vddf__ = vddf;
    }
  }
});

injectResources();
