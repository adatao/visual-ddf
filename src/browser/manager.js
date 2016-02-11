import Storage from './storage';
import vDDF from './vddf';
import fetch from 'fetch';

export default class Manager {
  constructor(config, storage) {
    if (!storage) {
      storage = new Storage(window.localStorage);
    }

    this.config = config;
    this.storage = storage;
  }

  async render() {
    // TODO: move render logic from embed.js
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

  async load(uri) {
    let response;

    if (this.config.baseUrl) {
      response = await fetch(`${this.config.baseUrl}/api/vddf/load`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({uri: uri})
      });
    } else {
      response = await fetch(uri, {});
    }

    if (response.status !== 200) {
      throw new Error(`Unable to retrieve vDDF`);
    }

    let json = await response.json();

    if (json.error) {
      throw new Error(json.error.message);
    }

    let result = json.result ? json.result : json;
    let vddf = new vDDF(result.uuid, uri, this.config);
    vddf.manager = this;
    vddf.deserialize(result);

    // restore from local storage and track changes
    this.storage.restore(vddf);
    this.storage.track(vddf);

    return vddf;
  }
}
