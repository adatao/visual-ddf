import $ from 'jQuery';
import * as magic from './magic';
import * as d3 from './d3';

const detectors = {
  magic, d3
};

export function detectSources(document) {
  let sources = [];

  for (let type in detectors) {
    sources = sources.concat(
      detectors[type]
        .detect(document)
        .map(s => ({...s, type}))
    );
  }

  return Promise.resolve(sources);
}

export function previewSource(source) {
  return detectors[source.type].preview(source);
}

export function extractSource(source) {
  return detectors[source.type].extract(source)
    .then(result => {
      // sanitize the name
      result.schema.forEach((c,i) => {
        let name = (c.name || `c${i+1}`).toLowerCase().replace(/[^a-z0-9]/gi, '_');

        if (/\d/.test(name[0])) {
          name = `c${name}`;
        }

        c.name = name;
      });

      return result;
    });
}
