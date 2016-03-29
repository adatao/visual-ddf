import $ from 'jquery';
// import _ from 'underscore';
import D3Deconstruct from 'src/browser/lib/d3-deconstruct';
import { getSource as getSvgSource } from 'src/browser/lib/svg-crowbar2-es6';

export function detect() {
  let found = 0, sources = [];

  $('svg').each(function() {
    const el = this;
    const $el = $(this);
    let isD3 = false;

    if (el.parentNode.className.indexOf('adaviz-chart') === -1) {
      $el.find('*').each(function (i, child) {
        if (child.__data__) {
          isD3 = true;
          return false;
        }
      });
    }

    if (isD3) {
      el.__d3__ = true;

      // const handle = createDragHandle(el);
      // $el.data('vddf-handler', handle.attr('id'));
      // $('body').append(handle);
      sources.push({
        node: el
      });
    }
  });

  return sources;
}

export function preview(source) {
  const node = source.node;

  node.setAttribute('version', '1.1');
  node.setAttribute('xmlns', 'http://www.w3.org/2000/svg');

  const svgSource = getSvgSource(node);
  const svgRaw = svgSource.source[0];
  const base64svg = btoa(unescape(encodeURIComponent(svgRaw)));

  return {
    ...source,
    title: svgSource.title,
    svg: svgRaw,
    previewUrl: 'data:image/svg+xml;base64,' + base64svg
  };
}

/**
 * Implement a heuristic ranking to pick the best schema from deconstruct schemas
 */
export function extract(source) {
  // TODO: we can guess the visualization base on the type of marks

  const node = source.node;
  const raw = D3Deconstruct.Deconstruct.deconstruct(node);
  const candidates = raw.groups.filter(s => {
    // for now only take group has schema
    if (s.schema.length === 0 || (s.schema.length == 1 && s.schema[0] === 'deconID')) {
      return false;
    }

    return true;
  }).map(s => {
    // reshape the array, we want to drop something on the way out
    let data = {}, schema = [], expandedSchema = {}, arrayFields = [], count = 0;

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
      } else if (sample && Array.isArray(sample)) {
        arrayFields.push(field);
      }

      schema.push(field);
      data[field] = values;
      count = Math.max(values.length, count);
    }

    // TODO: handle array of array field
    // we can do cartesian product to flatten out the array
    if (arrayFields) {
      const keyFields = schema.filter(f => arrayFields.indexOf(f) === -1);

      // TODO: flatten it :D
    }

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

  const result = flattenData(candidates[0]);
  result.candidates = candidates;

  return Promise.resolve(result);
}

// convert destructing data to vddf compatible format
function flattenData(candidate) {
  const count = candidate.data[candidate.schema[0]].length;

  // convert to vddf schema
  const data = [];

  let candidateSchema = candidate.schema.filter(c => {
    const sample = candidate.data[c][0];

    return sample !== null && sample !== undefined && typeof sample !== 'object';
  });
  let schema = candidateSchema.map(name => ({ name }));

  for (let i = 0; i < count; i++) {
    const row = [];

    candidateSchema.forEach(name => {
      row.push(candidate.data[name][i] || null);
    });

    data.push(row);
  }

  return {
    data,
    schema
  };
}

// function cartesianProductOf() {
//   return _.reduce(arguments, function(a, b) {
//     return _.flatten(_.map(a, function(x) {
//       return _.map(b, function(y) {
//         return x.concat([y]);
//       });
//     }), true);
//   }, [ [] ]);
// };
