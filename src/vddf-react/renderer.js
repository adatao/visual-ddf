import React from 'react';
import ReactDOM from 'react-dom';
import Chart from './components/chart';
import injectTapEventPlugin from 'react-tap-event-plugin';

/**
 * vDDF renderer with React and AdaViz
 */
export default class ReactRenderer {

  async loadResources() {
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

    require('./styles.css');

    if (!window.AdaViz) {
      require('../browser/lib/adaviz');
    }
  }

  async render(vddf, el) {
    try {
      let width = el.getAttribute('data-width');
      let height = el.getAttribute('data-height');

      // if not specify width, try to get element outer width
      if (!width) {
        width = el.offsetWidth;
      }

      // TODO: support full screen
      if (!height) {
        height = width * 3/4;
      }

      // cleanup
      ReactDOM.unmountComponentAtNode(el);
      el.innerHTML = '';

      ReactDOM.render(<Chart vddf={vddf} width={width} height={height} baseUrl={vddf.config.baseUrl} />, el);
    } catch (ex) {
      el.innerHTML = `Error: ${ex.message}`;
      console.log(ex.stack);
    }
  }
}
