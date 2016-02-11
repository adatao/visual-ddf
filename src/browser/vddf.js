import EventEmitter from 'eventemitter3';
import React from 'react';
import ReactDOM from 'react-dom';
import Chart from './components/chart';
import Immutable from 'immutable';
import SchemaDetector from './../vddf/schemadetector';
import suggestChartType from '../vddf/charttypes';

/**
 * vDDF implementation with React and AdaViz
 */
export default class vDDF extends EventEmitter {
  constructor(uuid, uri, config) {
    super();
    this.uuid = uuid;
    this.uri = uri;
    this.config = config;
  }

  _emitUpdate() {
    this.emit('update', {
      target: this
    });
  }

  _updateSchema() {
    let detector = new SchemaDetector();
    let newSchema = Immutable.fromJS(detector.detect(this.fetch(), this.schema));

    if (!Immutable.is(this.payload.get('schema'), newSchema)) {
      this.payload = this.payload.set('schema', newSchema);
    }

    this._chartTypes = suggestChartType(this.schema);
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
    return this._chartTypes;
  }

  get title() {
    return this.payload.get('title');
  }

  set title(value) {
    this.payload = this.payload.set('title', value);
    this._emitUpdate();
  }

  get visualization() {
    // we should expose explicitly each visualization attribute
    // to vDDF propert instead of one single chunk
    return this.payload.get('visualization').toJS();
  }

  set visualization(value) {
    this.payload = this.payload.set('visualization', Immutable.fromJS(value));
    this._emitUpdate();
  }

  fetch() {
    return this.payload.get('data').toJS();
  }

  updateData(data, schema) {
    this.payload = this.payload.set('data', Immutable.fromJS(data));

    if (schema) {
      this.payload = this.payload.set('schema', Immutable.fromJS(schema));
      this._updateSchema();
    }

    this._emitUpdate();
  }

  get schema() {
    return this.payload.get('schema').toJS();
  }

  set schema(value) {
    this.payload = this.payload.set('schema', Immutable.fromJS(value));
    this._updateSchema();
    this._emitUpdate();
  }

  // TODO: decouple this to a ReactVDDF
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
    this._updateSchema();
  }

  serialize() {
    return this.payload.toJS();
  }

  isModified() {
    return this.payload !== this.originalPayload;
  }

  revert() {
    if (this.originalPayload && this.isModified()) {
      this.payload = this.originalPayload;
      this._updateSchema();
      this._emitUpdate();
    }
  }
}
