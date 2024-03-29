import * as SQL from './sql';
import * as config from './config';
import Manager from 'src/vddf/manager';
import _ from 'lodash';
import { parseCsvLink } from './csv';

function init() {
  SQL.run(
    'create table if not exists metadata (' +
      'id integer primary key,'+
      'uuid text,' +
      'name text,' +
      'title text,' +
      'preview text,' +
      'createdAt date' +
      ')'
  );
}

init();

export function reset() {
  SQL.run('select * from metadata')
    .then(result => {
      const promises = [];

      for (let i = 0; i < result.rows.length; i++) {
        let row = result.rows[i];

        // catch so no promise will be rejected
        promises.push(
          SQL.run('drop table ' + row.name)
            .catch(() => { })
        );
      }

      return Promise.all(promises);
    })
    .then(_ => {
      SQL.run('drop table metadata');
      init();
    });
}

function cleanString(str) {
  return str
    .replace(/[^a-z0-9]/gi, '_') // special chars
    .replace(/_+/g, '_')
    .replace(/_+$/g, ''); // this will make the name easier to read
}

export async function getUniqueName(name) {
  let prefix = cleanString((name || 'untitled').toLowerCase());

  if (/^\d+/.test(prefix)) {
    prefix = `t${prefix}`;
  }

  let suggest = prefix;
  let counter = 1;

  while (true) {
    let result = await SQL.run('select * from metadata where name = ' + SQL.quote(suggest));

    if (result.rows.length === 0) break;

    // keep increasing the counter until we get one
    suggest = prefix + '_' + counter;
    counter++;
  }

  return suggest;
}

async function createDDFTable(name, schema) {
  const schemaString = schema.map(c => {
    let type = 'text';

    if (c.type === 'Integer') {
      type = 'integer';
    } else if (c.type === 'Float') {
      type = 'float';
    }

    return `\`${c.name}\` ${type}`;
  }).join(', ');

  const createTableString = `create table ${name} (${schemaString});`;

  return SQL.run(createTableString);
}

// XXX: Magic
function prepareViz(vddf, props = {}) {
  const name = props.name || vddf.name || vddf.title;

  if (vddf.chartType === 'datatable' || vddf.chartType === undefined) {
    console.log('Try to detect default mapping');

    const viz = vddf.visualization || {};
    viz.mapping = viz.mapping || {};

    if (/women-majors-pct/.test(name) || /when_women_stopped_coding/.test(name)) {
      viz.mapping = Object.assign(viz.mapping, {
        category: 'Year',
        measurement: 'Percentage',
        category2: 'Field'
      });
    } else {
      vddf.schema.forEach((c) => {
        if (!viz.mapping.category && (/years?/i.test(c.name) || c.type === 'String')) {
          viz.mapping.category = c.name;
        } else if (!viz.mapping.category2 && c.type === 'String') {
          viz.mapping.category2 = c.name;
        } else if (!viz.mapping.measurement && (c.type === 'Float' || c.type === 'Integer')) {
          viz.mapping.measurement = c.name;
        }
      });
    }

    // +___+
    viz.x = viz.mapping.category;
    viz.y = viz.mapping.measurement;
    viz.color = viz.mapping.category2;
    viz.type = 'datatable';

    // post magic ...
    if (/police[-_]shootings/.test(name)) {
      viz.mapping = Object.assign(viz.mapping, {
        category: 'manner_of_death',
        measurement: '',
        category2: '',
        aggregation: 'count'
      });

      viz.previousType = 'pie';
      viz.size = 'value';
      viz.color = 'manner_of_death';

      delete viz.x;
      delete viz.y;
    } else if (/cs-degrees|cs-bachelor-total-by-gender/.test(name)) {
      viz.mapping = Object.assign(viz.mapping, {
        category: 'Year',
        measurement: 'Graduates',
        category2: '',
        aggregation: 'sum'
      });

      viz.aggregation = 'sum';

      delete viz.color;
    } else if (/states of the united states in/i.test(name)) {
      viz.mapping = Object.assign(viz.mapping, {
        category: 'State',
        measurement: 'Population_2013_est',
        category2: '',
        aggregation: ''
      });

      viz.previousType = 'treemap';
      viz.size = 'State';
      viz.color = 'Population_2013_est';

      delete viz.x;
      delete viz.y;
    }

    if (viz.seriesMagic) {
      viz.type = 'bar.grouped';

      viz.series = [
        {
          name: 'Percentage of Women Graduates',
          axis: 'secondary',
          type: 'line'
        }
      ];

      viz.yLabel = 'Graduates';
      viz.yLabel2 = 'Percentage';
      viz.legendSort = 'none';

      // no more magic here...
      delete viz.seriesMagic;
    }

    vddf.visualization = viz;
  }
}

export function create(data) {
  let manager, vddf;

  return config.getServerUrl()
    .then(baseUrl => {
      manager = new Manager({ baseUrl });

      if (data.dataUrl) {
        return parseCsvLink(data.dataUrl)
          .then(result => {
            data.schema = result.schema;
            data.data = result.data;

            return data;
          });
      }

      return data;
    })
    .then(() => {
      // sanitize column names before creating vddf
      data.schema.forEach((c,i) => {
        c.name = cleanString(c.name);

        if (!c.name) c.name = `c${i}`;
      });

      return manager.load(_.pick(data, ['title', 'schema', 'source', 'data', 'visualization']));
    })
    .then(result => {
      vddf = result;

      // XXX: this should be in vddf
      const numericFields = [];

      vddf.schema.forEach((c,i) => {
        if (c.type === 'Integer' || c.type === 'Float') {
          numericFields.push(i);
        }
      });

      const newData = vddf.fetch().map(r => {
        numericFields.forEach(i => {
          if (typeof r[i] !== 'number') {
            r[i] = r[i] !== null && r[i] !== undefined ?
              parseFloat(r[i].replace(/,/g, '')) :
              null;
          }
        });

        return r;
      });

      vddf.updateData(newData);

      prepareViz(vddf, data);

      return manager.export(vddf);
    })
    .then(() => {
      // upload svg here if necessary
      if (data.svg) {
        data.preview = `${manager.config.baseUrl}/charts/${vddf.uuid}.svg`;
        return manager.client.request('POST', `api/vddf/${vddf.uuid}/svg`, { svg: data.svg }).then(() => vddf);
      }

      return vddf;
    })
    .then(() => {
      // a quick hack flag to not to store to workspace ...
      return createFromVDDF(vddf, data);
    });
}

export function createFromVDDF(vddf, props = {}) {
  if (!vddf.uuid) {
    prepareViz(vddf, props);
  }

  return new Promise((resolve, reject) => {
    if (vddf.uuid) {
      resolve(vddf);
    } else {
      resolve(vddf.manager.export(vddf));
    }
  })
  .then(result => {
    if (props.save !== false) {
      return _create({
          ...props,
        title: vddf.title,
        uuid: vddf.uuid,
        schema: vddf.schema,
        data: vddf.fetch()
      });
    } else {
      return result;
    }
  })
    .then(result => {
      if (props.embed) {
        return vddf.manager.embed(vddf)
          .then(embedResult => {
            result.embedResult = embedResult;

            return result;
          });
      } else return result;
    });
}

export function updatePreview(uuid, preview) {
  return SQL.run('update metadata set preview = ? where uuid = ?', [preview, uuid]);
}

async function _create(data) {
  data.name = await getUniqueName(data.name || data.title);

  try {
    await SQL.insert('metadata', {
      uuid: data.uuid,
      name: data.name,
      title: data.title,
      createdAt: new Date(),
      preview: data.preview
    });

    await createDDFTable(data.name, data.schema);
    await SQL.batchInsert(data.name, data.schema.map(s => s.name), data.data);

    console.log('Create new chart', data.name, 'sucessfully');
  } catch (ex) {
    remove(data.name); // do a safe clean

    console.log('Create vDDF error', ex);
    throw ex;
  }

  return data;
}

export function list() {
  return SQL.run('select * from metadata order by createdAt DESC')
    .then(result => {
      return [].slice.call(result.rows).map(r => ({
        name: r.name,
        uuid: r.uuid,
        title: r.title,
        preview: r.preview
      }));
    });
}

export function sql(query) {
  return SQL.run(query);
}

export async function remove(name) {
  const result = await SQL.run('select * from metadata where name = ? or uuid = ?', [name, name]);

  if (result.rows.length) {
    let row = result.rows[0];

    try {
      await SQL.run(`drop table ${row.name}`);
    } catch (ex) {}

    await SQL.run('delete from metadata where id = ?', [ row.id ]);

    return true;
  } else {
    return false;
  }
}
