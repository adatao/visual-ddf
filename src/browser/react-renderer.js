import React from 'react';
import ReactDOM from 'react-dom';
import Chart from './components/chart';

/**
 * vDDF renderer with React and AdaViz
 */
export default class ReactRenderer {
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

      ReactDOM.render(<Chart vddf={vddf} width={width} height={height} baseUrl={vddf.config.baseUrl} />, el);
    } catch (ex) {
      el.innerHTML = `Error: ${ex.message}`;
      console.log(ex.stack);
    }
  }
}
