import EventEmitter from 'eventemitter3';
import React from 'react';
import ReactDOM from 'react-dom';
import Chart from './components/chart';
import Immutable from 'immutable';

/**
 * vDDF implementation with React and AdaViz
 */
export default class vDDF extends EventEmitter {
  constructor(uri, config) {
    super();
    this.uuid = uri;
    this.uri = uri;
    this.config = config;
  }

  _emitUpdate() {
    this.emit('update', {
      target: this
    });
  }

  changeChartType(type) {
    this.payload = this.payload.mergeDeep({
      visualization: {
        type: type
      }
    });

    this._emitUpdate();
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
    this._emitUpdate();
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

  serialize() {
    return this.payload.toJS();
  }

  isModified() {
    return this.payload !== this.originalPayload;
  }

  revert() {
    if (this.isModified()) {
      this.payload = this.originalPayload;
      this._emitUpdate();
    }
  }
}
