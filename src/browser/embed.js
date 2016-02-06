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

function mountAllvDDF() {
  // TODO: this may not be compatible with old browsers

  let config = window.vDDF && window.vDDF.config ? window.vDDF.config : {};
  let elements = document.querySelectorAll('[data-vddf]');

  for (let i = 0; i < elements.length; i++) {
    const el = elements[i];

    if (!el.className.includes('vddf-chart')) {
      const uri = el.getAttribute('data-vddf');

      el.className = 'vddf-chart';
      vDDF.load(uri, config)
        .then((vddf) => {
          el.__vddf__ = vddf;
          vddf.render(el);
        });
    }
  }
}

if (window.vDDF) {
  window.vDDF.load = vDDF.load;
}

injectResources();


if (document.readyState === 'complete') {
  mountAllvDDF();
} else {
  window.addEventListener('load', mountAllvDDF);
}
