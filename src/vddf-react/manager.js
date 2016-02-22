import Manager from '../vddf/manager';
import ReactRenderer from './renderer';

export default class ReactvDDFManager extends Manager {
  constructor(...args) {
    super(...args);

    this.config.renderer = new ReactRenderer();
    this.config.renderer.loadResources();
  }
}
