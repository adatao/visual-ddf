import 'babel-polyfill';
import './styles.css';
import './lib/adaviz';
import injectTapEventPlugin from 'react-tap-event-plugin';
import Manager from './manager';
import vDDF from './vddf';


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
  // TODO: this may not be compatible with old browsers

  let elements = document.querySelectorAll('[data-vddf]');

  for (let i = 0; i < elements.length; i++) {
    const el = elements[i];

    if (!el.className.includes('vddf-chart')) {
      const uri = el.getAttribute('data-vddf');

      el.className = 'vddf-chart';
      window.vDDF.manager.load(uri)
        .then((vddf) => {
          el.__vddf__ = vddf;
          vddf.render(el);
        }).catch(err => {
          console.log(err.stack);
        });
    }
  }
}

if (window.vDDF && !window.vDDF.manager) {
  window.vDDF.manager = new Manager(window.vDDF.config);
}

injectResources();


if (document.readyState === 'complete') {
  mountAllvDDF();
} else {
  window.addEventListener('load', mountAllvDDF);
}
