import chart2 from 'src/chrome/assets/chart2.js';
import { parseCsvLink } from './csv';

// all the chart magic go here!
const charts = {
  women_coding: {
    title: 'What Happened To Women In Computer Science?',
    name: 'when_women_stopped_coding',
    previewUrl: 'https://s3.amazonaws.com/vddf/women-coding.svg',
    dataUrl: 'https://s3.amazonaws.com/vddf/women-coding.csv',
    type: 'magic',
    selector: '#responsive-embed-women-cs iframe',
    visualization: {
      previousType: 'line'
    }
  },

  police_shooting: {
    title: 'Police Shootings',
    name: 'police_shootings',
    previewUrl: 'https://s3.amazonaws.com/vddf/police-shootings.svg',
    dataUrl: 'https://s3.amazonaws.com/vddf/police-shootings.csv',
    type: 'magic'
    // selector: '#map-wrap'
  },

  obama_care: {
    title: 'Obama’s Health Law: Who Was Helped Most',
    name: 'obama_health_law',
    previewUrl: 'https://s3.amazonaws.com/vddf/obama-care.png',
    dataUrl: 'https://s3.amazonaws.com/vddf/obama-care.csv',
    type: 'magic',
    selector: '#g-change-map'
  },

  corporate_taxes: {
    title: 'Across U.S. Companies, Tax Rates Vary Greatly',
    name: 'corporate_taxes',
    previewUrl: 'https://s3.amazonaws.com/vddf/corporate-taxes.png',
    // dataUrl: 'https://s3.amazonaws.com/vddf/corporate-taxes.csv?v=1',
    type: 'magic',
    selector: '.g-graphic svg'
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
  } else if (/nytimes.com.*corporate-taxes/.test(location)) {
    // http://www.nytimes.com/interactive/2013/05/25/sunday-review/corporate-taxes.html?_r=1&
    const data = Object.assign(charts.corporate_taxes, chart2);
    sources.push(charts.corporate_taxes);
  }

  return sources;
}

// just pass through
export function preview(source) {
  return source;
}

export function extract(source) {
  return Promise.resolve(source);
}
