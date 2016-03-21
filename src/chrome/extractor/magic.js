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
  },

  police_shooting: {
    title: 'Police Shootings',
    name: 'police_shootings',
    previewUrl: '',
    type: 'magic'
  }
};

export function detect(document) {
  const location = window.location + '';
  const sources = [];

  if (/npr.org.*when-women-stopped-coding/.test(location)) {
    sources.push(charts.women_coding);
  } else if (/washingtonpost.com.*police-shootings/.test(location)) {
    console.log('police shooting');
  }

  return sources;
}

// just pass through
export function preview(source) {
  return source;
}

export function extract(source) {
  // TODO: backend should accept data url and extract it
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
