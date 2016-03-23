import $ from 'jquery';
import * as magic from './magic';
import * as d3 from './d3';
import * as table from './table';
import * as vddf from './vddf';

const detectors = {
  magic, d3, table, vddf
};

export function detectSources(document) {
  let sources = [];

  for (let type in detectors) {
    sources = sources.concat(
      detectors[type]
        .detect(document)
        .map(s => ({...s, type}))
    );

    // let the magic take it all ...
    if (sources.length && type == 'magic') {
      break;
    }
  }

  return Promise.resolve(sources);
}

export function previewSource(source) {
  return detectors[source.type].preview(source);
}

export function extractSource(source) {
  return detectors[source.type].extract(source);
}

// for debugging
window.__detectors = detectors;
