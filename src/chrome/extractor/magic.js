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
    previewUrl: 'https://s3.amazonaws.com/vddf/police-shootings.svg',
    dataUrl: 'https://s3.amazonaws.com/vddf/police-shootings.csv',
    type: 'magic'
  },

  obama_care: {
    title: 'Obama’s Health Law: Who Was Helped Most',
    name: 'obama_health_law',
    previewUrl: 'https://s3.amazonaws.com/vddf/obama-care.png',
    dataUrl: 'https://s3.amazonaws.com/vddf/obama-care.csv',
    type: 'magic'
  }
};

export function detect(document) {
  const location = window.location + '';
  const sources = [];

  if (/npr.org.*when-women-stopped-coding/.test(location)) {
    sources.push(charts.women_coding);
  } else if (/washingtonpost.com.*police-shootings/.test(location)) {
    sources.push(charts.police_shooting);
  } else if (/nytimes.com.*obamacare/.test(location)) {
    // http://www.nytimes.com/interactive/2014/10/29/upshot/obamacare-who-was-helped-most.html
    sources.push(charts.obama_care);
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

      // remove the last empty row
      if (data) {
        const lastRow = data[data.length - 1];

        if (lastRow.length == 1 && lastRow[0] === '') {
          data.pop();
        }
      }

      return {
        data, schema
      };
    });
}
