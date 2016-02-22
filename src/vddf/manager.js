import Storage from './storage';
import vDDF from './vddf';
import fetch from 'fetch';
import UrlLoader from './loaders/url';

export default class Manager {
  constructor(config, storage) {
    if (!storage) {
      storage = new Storage(window.localStorage);
    }

    this.config = config;
    this.storage = storage;
    this.handlers = {};

    // setup loaders with default loaders
    this.loaders = [
      new UrlLoader(this.config.baseUrl)
    ];
  }

  addHandler(handler) {
    handler.register(this);
  }

  addHandle(name, callback) {
    if (!this.handlers[name]) {
      this.handlers[name] = [];
    }

    this.handlers[name].push(callback);
  }

  async handle(name, ...args) {
    let result = null;

    if (this.handlers[name]) {
      for (let i in this.handlers[name]) {
        let handle = this.handlers[name][i];
        result = await handle(...args);
      }
    }

    return result;
  }

  create(uuid, source, data) {
    let vddf = new vDDF(uuid, source, this.config);
    vddf.manager = this;

    if (!data.visualization) {
      data.visualization = {
        type: 'datatable'
      };
    }

    vddf.deserialize(data);

    return vddf;
  }

  async render(vddf, ...params) {
    if (this.config.renderer) {
      this.config.renderer.render(vddf, ...params);
    } else {
      throw new Error('Renderer is not available');
    }
  }

  async getDownloadLink(vddf) {
    let csv = '';

    // header
    csv += vddf.schema.map(field => `\"${field.name}\"`).join(',') + '\n';

    vddf.fetch().forEach(row => {
      csv += row.map(field => `\"${field}\"`).join(',') + '\n';
    });

    return `data:application/csv;charset=utf-8,` + encodeURIComponent(csv);
  }

  async embed(vddf) {
    const apiUrl = `${this.config.baseUrl}/api/vddf/${vddf.uuid}/embed`;

    let response = await fetch(apiUrl);

    let result = await response.json();
    if (result.error) {
      throw new Error(result.error);
    }

    return result.result;
  }

  // export keyword has problem with emacs :(
  async ['export'](vddf) {
    const apiUrl = `${this.config.baseUrl}/api/vddf/create`;
    let body = vddf.serialize();

    // remove uuid and change the source
    delete body.uuid;
    body.source = vddf.uri;

    let response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    });

    let result = await response.json();
    if (result.error) {
      throw new Error(result.error);
    }

    return result.result;
  }

  async load(source) {
    let vddf;

    // loop through all loaders to check if any of it support this source
    for (let i in this.loaders) {
      const loader = this.loaders[i];

      if (loader.isSupported(source)) {
        vddf = await loader.load(source, this);
        break;
      }
    }

    if (!vddf) {
      throw new Error('Source type is not supported');
    } else if (vddf.uuid) {
      // restore from local storage and track changes
      this.storage.restore(vddf);
      this.storage.track(vddf);
    }

    return vddf;
  }
}
