import fetch from 'fetch';
import React from 'react';
import ReactDOM from 'react-dom';
import Chart from './components/chart';
import BasevDDF from 'src/vddf';

/**
 * vDDF implementation with React and AdaViz
 */
export default class vDDF extends BasevDDF {
  constructor(el, uri, config) {
    super(uri);
    this.element = el;
    this.uri = uri;
    this.config = config;
  }

  changeChartType(type) {
    this.visualization.type = type;
  }

  getAvailableCharts() {
    // XXX: figure out by schema
    return ['donut', 'bar', 'pie', 'datatable'];
  }

  async load() {
    if (!this.vddf) {
      let response = await fetch(this.uri + '.json', {});

      if (response.status !== 200) {
        throw new Error(`Unable to retrieve vDDF`);
      }

      let json = await response.json();

      if (json.error) {
        throw new Error(json.error.message);
      }

      this.vddf = json;
      this.title = this.vddf.title;
    }

    return this.vddf;
  }

  get visualization() {
    return this.vddf.visualization;
  }

  fetch() {
    return this.vddf.data;
  }

  update(data) {
    this.vddf.data = data;
  }

  getSchema() {
    return this.vddf.schema;
  }

  async render() {
    try {
      await this.load();

      let width = this.element.getAttribute('data-width');
      let height = this.element.getAttribute('data-height');

      // if not specify width, try to get element outer width
      if (!width) {
        width = this.element.offsetWidth;
      }

      // TODO: support full screen
      if (!height) {
        height = width * 3/4;
      }

      ReactDOM.render(<Chart vddf={this} width={width} height={height} baseUrl={this.config.baseUrl} />, this.element);
    } catch (ex) {
      this.element.innerHTML = `Error: ${ex.message}`;
      console.log(ex.stack);
    }
  }
}
