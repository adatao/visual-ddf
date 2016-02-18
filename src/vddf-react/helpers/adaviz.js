/**
 * Helper class to convert metadata from vddf to adaviz
 */
export default class AdaVizHelper {
  updateMapping(type, mapping, viz) {
    viz.mapping = mapping;

    if (type) {
      viz.type = type;
    }

    if (viz.type == 'heatmap') {
      viz.y = mapping.category;
      viz.x = mapping.category2;
      viz.color = mapping.measurement;
    } else {
      if (viz.orientation === 'horizontal') {
        viz.y = mapping.category;
        viz.x = mapping.measurement;
      } else {
        viz.x = mapping.category;
        viz.y = mapping.measurement;
      }

      viz.color = mapping.category2;
    }

    viz.aggregation = mapping.aggregation;

    if (!viz.color) delete viz.color;
    delete viz.xLabel;
    delete viz.yLabel;
    delete viz.measurementColumns;

    return viz;
  }

  /**
   * Extract mapping from existing visualization specification
   */
  extractMapping(viz) {
    let mapping = viz.mapping || viz;

    const category = mapping.category || (viz.orientation === 'horizontal' ? viz.y : viz.x);
    const measurement = mapping.measurement || (viz.orientation === 'horizontal' ? viz.x : viz.y);
    const category2 = mapping.category2 || viz.color || viz.detail;
    const aggregation = mapping.aggregation;

    return { category, measurement, category2, aggregation };
  }
}
