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