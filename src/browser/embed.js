import 'babel-polyfill';
import 'material-ui/lib/text-field';
import Manager from '../vddf/manager';
import ReactRenderer from '../vddf-react/renderer';

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
  let renderer = new ReactRenderer();
  renderer.loadResources();
  window.vDDF.config.renderer = renderer;
  window.vDDF.manager = new Manager(window.vDDF.config);
  window.vDDF.mountAll = mountAllvDDF;
}

if (document.readyState === 'complete') {
  mountAllvDDF();
} else {
  window.addEventListener('load', mountAllvDDF);
}
