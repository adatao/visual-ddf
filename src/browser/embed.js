import 'babel-polyfill';
import './styles.css';
import './lib/adaviz';
import injectTapEventPlugin from 'react-tap-event-plugin';
import Manager from '../vddf/manager';
import ReactRenderer from './react-renderer';

function injectResources() {
  let head = document.getElementsByTagName('head')[0];

  try {
    injectTapEventPlugin();
  } catch (ex) {
    // safe to ingore
  }

  if (head) {
    let iconFont = document.createElement('link');
    iconFont.setAttribute('href', 'https://fonts.googleapis.com/icon?family=Material+Icons');
    iconFont.setAttribute('rel', 'stylesheet');

    head.appendChild(iconFont);
  }
}

function mountAllvDDF() {
  // TODO: querySelectorAll may not be available in older browsers.
  let elements = document.querySelectorAll('[data-vddf]');

  for (let i = 0; i < elements.length; i++) {
    const el = elements[i];

    if (!el.className.includes('vddf-chart')) {
      const uri = el.getAttribute('data-vddf');

      el.className = 'vddf-chart';
      window.vDDF.manager.load(uri)
        .then((vddf) => {
          el.__vddf__ = vddf;
          return vddf.render(el);
        }).catch(err => {
          console.log(err.stack);
        });
    }
  }
}

if (window.vDDF && !window.vDDF.manager) {
  window.vDDF.config.renderer = new ReactRenderer();
  window.vDDF.manager = new Manager(window.vDDF.config);
  window.vDDF.mountAll = mountAllvDDF;
  injectResources();
}

if (document.readyState === 'complete') {
  mountAllvDDF();
} else {
  window.addEventListener('load', mountAllvDDF);
}
