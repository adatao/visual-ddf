import 'babel-polyfill';
import 'material-ui/lib/text-field';
import 'whatwg-fetch';
import Manager from '../vddf-react/manager';

function mountAllvDDF() {
  // TODO: querySelectorAll may not be available in older browsers.
  let elements = document.querySelectorAll('[data-vddf]');

  for (let i = 0; i < elements.length; i++) {
    const el = elements[i];

    if (!el.className.includes('vddf-chart')) {
      const uri = el.getAttribute('data-vddf');

      window.vDDF.manager.load(uri)
        .then((vddf) => {
          return vddf.render(el);
        }).catch(err => {
          console.log(err.stack);
        });
    }
  }
}

if (window.vDDF && !window.vDDF.manager) {
  window.vDDF.manager = new Manager(window.vDDF.config);
  window.vDDF.mountAll = mountAllvDDF;
}

if (document.readyState === 'complete') {
  mountAllvDDF();
} else {
  window.addEventListener('load', mountAllvDDF);
}
