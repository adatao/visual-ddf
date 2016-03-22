export function detect(document) {
  // search for non-empty table
  const tables = [].slice.call(document.querySelectorAll('table'));

  // only choose visible tables with data and with a thead
  return tables.filter(t => t.offsetHeight > 0
                       && (t.className !== '' && t.className.indexOf('vddf-table') === -1)
                       && t.querySelectorAll('tr').length > 0
                       && t.querySelectorAll('thead').length > 0
                      )
    .map(dom => {
      const caption = dom.querySelector(':scope > caption');

      return {
        title: caption ? parseDom(caption) : '',
        node: dom
      };
    });
}

export function preview(source) {
  return source;
}

export function extract(source) {
  return Promise.resolve(parseTable(source.node));
}

export function parseTable(tableDom) {
  let data = [], schema = [], tmpSchema = [], title;

  // TODO: look up for caption

  for (let i in tableDom.children) {
    let dom = tableDom.children[i];

    if (dom.tagName === 'CAPTION') {
      title = parseDom(dom);
    } else if (dom.tagName === 'THEAD') {
      //throw new Error('Not implemented');
      let row = dom.children[0];

      for (let j = 0; j < row.children.length; j++) {
        tmpSchema.push(parseDom(row.children[j]));
      }
    } else if (dom.tagName === 'TBODY') {
      data = parseBody(dom, schema);
    }
  }

  // reconstruct schema from table
  if (!data.length) throw new Error('Table is empty');

  // map to right schema format
  if (tmpSchema.length) schema = tmpSchema;
  schema = schema.map(name => ({ name }));

  return { title, data, schema };
}

function parseBody(tableBody, schema) {
  let rows = [];

  // TODO: colspan support
  for (let i = 0; i < tableBody.children.length; i++) {
    let rowDom = tableBody.children[i];
    let row = [];

    for (let j = 0; j < rowDom.children.length; j++) {
      let dom = rowDom.children[j];
      let columnName = `column${j+1}`;

      // TODO: detect right type here
      if (schema.indexOf(columnName) === -1) {
        schema.push(columnName);
      }

      // TODO: if dom has no children then we should use null
      row.push(parseDom(dom));
    }

    rows.push(row);
  }

  return rows;
}

function parseRow() {
  
}

export function parseDom(dom) {
  if (dom.children.length) {
    let clone = dom.cloneNode(true);

    // try to remove unused dom for now ....
    ['sup', '.sortkey'].forEach(selector => {
      let children = clone.querySelectorAll(selector);

      for (let i = 0; i < children.length; i++) {
        try {
          let child = children[i];
          child.remove();
        } catch (ex) {
          console.log(ex);
        }
      }
    });

    dom = clone;
  }

  // see https://developer.mozilla.org/en-US/docs/Web/API/Node/textContent#Differences_from_innerText
  return parseText(dom.innerText || dom.textContent);
}

const FLOAT_REGEXP = /^-?[0-9]+(\.[0-9]+)?$/;

// TODO: ref here https://github.com/mholt/PapaParse
function parseText(raw) {
  // let's trim data first
  let text = raw ? raw.replace(/^\s+|\s+$/g, '') : "";

  if (FLOAT_REGEXP.test(text)) {
    try {
      text = parseFloat(text);
    } catch (ex) {
      // ignore?
    }
  }

  return text;
}
