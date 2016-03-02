/**
 * Load a VDDF from js object
 */
export default class InlineLoader {
  isSupported(source) {
    return typeof source === 'object' && Array.isArray(source.data);
  }

  async load(source, manager) {
    return manager.create(source.uuid, source.uri, source);
  }
}
