import D3Deconstruct from 'src/browser/lib/d3-deconstruct';

/**
 * Implement a heuristic ranking to pick the best schema from deconstruct schemas
 */
export function extractD3Data(node) {
  const raw = D3Deconstruct.Deconstruct.deconstruct(node);
  const candidates = raw.groups.filter(s => {
    // for now only take group has schema
    if (s.schema.length === 0 || (s.schema.length == 1 && s.schema[0] === 'deconID')) {
      return false;
    }

    return true;
  }).map(s => {
    // reshape the array, we want to drop something on the way out
    let data = {}, schema = [], expandedSchema = {};

    // XXX: the schema itself is an array of objects
    // http://bl.ocks.org/mbostock/raw/3883245/

    for (let i = 0; i < s.schema.length; i++) {
      let field = s.schema[i];
      const values = s.data[field];
      const sample = values[0];

      if (field === 'deconID') {
        continue;
      } else if (s.nodeType === 'path') {
        // topojson / geojson stuff
        if (typeof sample === 'object' && ((sample.geometry || sample.coordinates) && sample.type)) continue;

        // XXX: we may want to get the data out of topojson? o.properties
        // http://bl.ocks.org/rpgove/raw/4016178/
      }

      if (sample && typeof sample === 'object' && !Array.isArray(sample)) {
        // try to expand the array of object
        const sampleSchema = Object.keys(sample);

        if (sampleSchema.length === 0) continue;

        // XXX: we don't handle schema conflict here yet
        // const hasFieldConflict = sampleSchema.some(f => s.schema.indexOf(f) !== -1);

        schema = schema.concat(sampleSchema);
        values.forEach(v => {
          sampleSchema.forEach(f => {
            if (!data[f]) data[f] = [v[f]];
            else data[f].push(v[f]);
          });
        });

        continue;
      }

      schema.push(field);
      data[field] = values;
    }

    // TODO: handle array of array field
    // we can do cartesian product to flatten out the array

    return {
      data,
      schema,
      nodeType: s.nodeType
    };
  }).sort((a,b) => {
    // prefer schema with more fields
    if (a.schema.length > b.schema.length) {
      return -1;
    } else if (a.schema.length === b.schema.length) {
      // prefer anything else over text
      if (b.nodeType === 'text') {
        return -1;
      }
    }

    return 1;
  });

  return {
    candidate: candidates[0], // pick the top candidate
    candidates,
    raw
  };
}
