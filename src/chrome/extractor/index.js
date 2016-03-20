import $ from 'jQuery';
import * as magic from './magic';
import * as d3 from './d3';

export function detectSources(document) {
  return d3.detect(document);
}

export function previewSource(source) {
  return d3.preview(source);
}

/**
 * Implement a heuristic ranking to pick the best schema from deconstruct schemas
 */
export function extractSource(source) {
  let result;
  const extractors = [ d3.extract ];

  for (let i in extractors) {
    result = extractors[i](source);

    if (result) break;
  }

  return result;
}
