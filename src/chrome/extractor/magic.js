import fetch from 'fetch';
import PapaParse from 'papaparse';

// all the chart magic go here!
const charts = {
  women_coding: {
    title: 'What Happened To Women In Computer Science?',
    name: 'when_women_stopped_coding',
    previewUrl: 'https://s3.amazonaws.com/vddf/women-coding.svg',
    dataUrl: 'https://s3.amazonaws.com/vddf/women-coding.csv',
    type: 'magic'
  }
};

export function detect(document) {
  const location = window.location + '';
  const sources = [];

  if (/npr.org.*when-women-stopped-coding/.test(location)) {
    sources.push(charts.women_coding);
  }

  return sources;
}

// just pass through
export function preview(source) {
  return source;
}

export function extract(source) {
  return fetch(source.dataUrl, {})
    .then(res => res.text())
    .then(text => {
      const raw = PapaParse.parse(text);
      const schema = raw.data[0].map(name => ({name}));
      const data = raw.data.slice(1);

      return {
        data, schema
      };
    });
}
