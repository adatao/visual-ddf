import EventEmitter from 'eventemitter3';

/**
 * Visual DDF Interface
 */
export default class vDDF extends EventEmitter {
  constructor(uuid) {
    super();
    this.uuid = uuid;
    this.filters = [];
  }

  /**
   * Return available charts for changing
   */
  getAvailableCharts() {
    throw new Error('Not implemented');
  }

  /**
   * Change current chart type
   */
  changeChartType(type) {
    throw new Error('Not implemented');
  }

  /**
   * Get current filters
   */
  getFilters() {
    return this.filters;
  }

  /**
   * Add a new filter to vDDF
   */
  addFilter(filter) {
    this.filters.push(filter);
  }

  /**
   * Remove filter by index
   */
  removeFilter(index) {
    this.filters.splice(index, 1);
  }

  async render() {
    throw new Error('Not implemented');
  }

  async update() {
    throw new Error('Not implemented');
  }

  /**
   * Fetch data
   */
  async fetch() {
    throw new Error('Not implemented');
  }

  getSchema() {
    throw new Error('Not implemented');
  }

  /**
   * Persist current change
   */
  async persist() {
    throw new Error('Not implemented');
  }
}
