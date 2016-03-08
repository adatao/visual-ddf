/**
 * Helper class to convert metadata from vddf to adaviz
 */
export default class AdaVizHelper {

  /**
   * Convert vddf to adaviz data structure
   *
   */
  static async fetchData(vddf) {
    // vDDF stores data as an array of array
    // AdaViz expected it as an array of objects.
    //  We can unify them both in the future, but not a priority for now.
    const raw = await vddf.fetch();

    return raw.map(d => {
      return vddf.schema.reduce((obj,column,idx) => {
        return { ...obj, [column.name]: d[idx] };
      }, {});
    });
  }

  /**
   * Prepare data for visualization based on the aggregation data
   */
  static async aggregateData(vddf) {
    let data = await this.fetchData(vddf);
    let viz = vddf.visualization;
    const mapping = viz.mapping || {};
    let aggregation = viz.aggregation;

    // automatically fallback to count to make the visualization eaiser
    if (!aggregation && mapping.category && !mapping.measurement) {
      aggregation = 'count';
    }

    if (aggregation && viz.type !== 'datatable') {
      let groupBy = {};
      let keys = [viz.x];
      let measurement = viz.y;

      if (mapping) {
        keys = [mapping.category];
        measurement = mapping.measurement;

        if (mapping.category2) {
          keys.push(mapping.category2);
        }
      } else {
        // parameters passed by adaviz is messed up, there is no way
        // we can identify which part is category and measurement
        if (viz.orientation === 'horizontal') {
          keys = [viz.y];
          measurement = viz.x;
        }

        if (viz.color) {
          keys.push(viz.color);
        }
      }

      if (!measurement) measurement = '_value';

      // this is like d3.nest
      data.forEach(d => {
        const key = keys.reduce((obj, cur) => ({ ...obj, [cur]: d[cur]}), {});
        const hash = Object.values(key).join(',');

        if (!groupBy[hash]) {
          groupBy[hash] = {
            key: key,
            values: []
          };
        }

        groupBy[hash].values.push(d);
      });

      // then roll up
      data = Object.values(groupBy).map(g => {
        let value;
        let series = g.values.map(c => c[measurement] ? parseFloat(c[measurement]) : 0);

        switch (aggregation) {
        case 'count':
          value = series.length;
          break;
        case 'min':
          value = series.reduce((prev, cur) => Math.min(prev, cur));
          break;
        case 'max':
          value = series.reduce((prev, cur) => Math.max(prev, cur));
          break;
        case 'sum':
          value = series.reduce((prev, cur) => prev + cur, 0);
          break;
        case 'avg':
          value = series.reduce((prev, cur) => prev + cur, 0) / g.values.length;
          break;
        }

        return {
          ...g.key,
          [measurement]: value
        };
      });
    }

    return data;
  }

  static updateMapping(type, mapping, viz) {
    viz.mapping = mapping;

    if (type) {
      viz.type = type;
    }

    if (viz.type == 'pie' || viz.type == 'donut') {
      viz.size = mapping.measurement;
      viz.color = mapping.category;

      if (!viz.size) viz.size = '_value';
    } else if (viz.type == 'heatmap') {
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
  static extractMapping(viz) {
    let mapping = viz.mapping || viz;

    const category = mapping.category || (viz.orientation === 'horizontal' ? viz.y : viz.x);
    const measurement = mapping.measurement || (viz.orientation === 'horizontal' ? viz.x : viz.y);
    const category2 = mapping.category2 || viz.color || viz.detail;
    const aggregation = mapping.aggregation;

    return { category, measurement, category2, aggregation };
  }
}
