import 'babel-polyfill';
import './lib/adaviz';
import vDDF from './vddf';

window.addEventListener('load', () => {
  // TODO: this may not be compatible with old browsers
  let elements = document.querySelectorAll('[data-vddf]');

  for (let i = 0; i < elements.length; i++) {
    const el = elements[i];
    const uri = el.getAttribute('data-vddf');

    let vddf = new vDDF(el, uri);
    vddf.render();
  }
});
