import fetch from 'fetch';
import PapaParse from 'papaparse';

// TODO: backend should accept data url and extract it
export function parseCsvLink(link) {
  return fetch(link, {})
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
