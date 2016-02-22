import Manager from '../vddf/manager';
import ReactRenderer from './renderer';
import DownloadCsvHandler from './handlers/download-csv';

export default class ReactvDDFManager extends Manager {
  constructor(...args) {
    super(...args);

    this.config.renderer = new ReactRenderer();
    this.config.renderer.loadResources();

    this.addHandler(new DownloadCsvHandler());
  }
}
