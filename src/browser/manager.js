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

  async getDownloadLink(vddf) {
    let csv = '';

    // header
    csv += vddf.getSchema().map(field => `\"${field.name}\"`).join(',') + '\n';

    vddf.fetch().forEach(row => {
      csv += row.map(field => `\"${field}\"`).join(',') + '\n';
    });

    return `data:application/csv;charset=utf-8,` + encodeURIComponent(csv);
  }

  async export(vddf) {
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
    let response = await fetch(uri + '.json', {});

    if (response.status !== 200) {
      throw new Error(`Unable to retrieve vDDF`);
    }

    let json = await response.json();

    if (json.error) {
      throw new Error(json.error.message);
    }

    let vddf = new vDDF(uri, this.config);
    vddf.manager = this;
    vddf.deserialize(json);

    this.storage.restore(vddf);
    this.storage.track(vddf);

    return vddf;
  }
}
