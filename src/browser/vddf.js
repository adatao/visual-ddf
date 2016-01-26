import fetch from 'fetch';
import AdaViz from 'adaviz';

export default class vDDF {
  constructor(el, uri) {
    this.element = el;
    this.uri = uri;
  }

  async fetch() {
    let response = await fetch(this.uri + '.json', {});

    if (response.status !== 200) {
      throw new Error(`Unable to retrieve vDDF`);
    }

    return await response.json();
  }

  async render() {
    try {
      let ddf = await this.fetch();
      let viz = document.createElement('div');
      viz.className = 'viz-container';

      AdaViz.render(viz, Object.assign(ddf.visualization, {
        data: ddf.data
      }));

      this.element.appendChild(viz);
    } catch (ex) {
      this.element.innerHTML = `Error: ${ex.message}`;
      console.log(ex.stack);
    }
  }
}
