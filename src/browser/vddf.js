import fetch from 'fetch';
import React from 'react';
import ReactDOM from 'react-dom';
import Chart from './components/chart';
import BasevDDF from 'src/vddf';

/**
 * vDDF implementation with React and AdaViz
 */
export default class vDDF extends BasevDDF {
  constructor(el, uri) {
    super(uri);
    this.element = el;
    this.uri = uri;
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

      this.vddf = await response.json();
      this.title = this.vddf.title;
    }

    return this.vddf;
  }

  get visualization() {
    return this.vddf.visualization;
  }

  async fetch() {
    await this.load();

    return this.vddf.data;
  }

  getSchema() {
    return this.vddf.schema;
  }

  async render() {
    try {
      ReactDOM.render(<Chart vddf={this} />, this.element);
    } catch (ex) {
      this.element.innerHTML = `Error: ${ex.message}`;
      console.log(ex.stack);
    }
  }
}

