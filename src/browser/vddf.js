import fetch from 'fetch';
import React from 'react';
import ReactDOM from 'react-dom';
import Chart from './components/chart';
import BasevDDF from 'src/vddf';
import Immutable from 'immutable';

/**
 * vDDF implementation with React and AdaViz
 */
export default class vDDF extends BasevDDF {
  constructor(uri, config) {
    super(uri);
    this.uri = uri;
    this.config = config;
  }

  changeChartType(type) {
    this.payload = this.payload.mergeDeep({
      visualization: {
        type: type
      }
    });

    this.emit('update');
  }

  getChartType() {
    return this.visualization.type;
  }

  getAvailableCharts() {
    // TODO: figure out metadata by schema
    if (this.visualization.alternatives) {
      return this.visualization.alternatives.split(',');
    }

    return [this.visualization.type, 'datatable'];
  }

  get title() {
    return this.payload.get('title');
  }

  set title(value) {
    this.payload.set('title', value);
  }

  get visualization() {
    // we should expose explicitly each visualization attribute
    // to vDDF propert instead of one single chunk
    return this.payload.get('visualization').toJS();
  }

  fetch() {
    return this.payload.get('data').toJS();
  }

  update(data) {
    this.payload = this.payload.set('data', Immutable.fromJS(data));
    this.emit('update');
  }

  getSchema() {
    return this.payload.get('schema').toJS();
  }

  async render(el) {
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

      ReactDOM.render(<Chart vddf={this} width={width} height={height} baseUrl={this.config.baseUrl} />, el);
    } catch (ex) {
      el.innerHTML = `Error: ${ex.message}`;
      console.log(ex.stack);
    }
  }

  deserialize(payload) {
    this.originalPayload = Immutable.fromJS(payload);
    this.payload = this.originalPayload;
  }

  isModified() {
    return this.payload !== this.originalPayload;
  }

  revert() {
    if (this.isModified()) {
      this.payload = this.originalPayload;
      this.emit('update');
    }
  }

  static async load(uri, config) {
    let response = await fetch(uri + '.json', {});

    if (response.status !== 200) {
      throw new Error(`Unable to retrieve vDDF`);
    }

    let json = await response.json();

    if (json.error) {
      throw new Error(json.error.message);
    }

    let vddf = new vDDF(uri, config);
    vddf.deserialize(json);

    return vddf;
  }
}
