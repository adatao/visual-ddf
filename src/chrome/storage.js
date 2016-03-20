import * as SQL from './sql';

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

export async function getUniqueName(name) {
  let prefix = name || 'untitle';

  prefix = prefix.toLowerCase()
    .replace(/[^a-z0-9]/gi, '_') // special chars
    .replace(/_+/g, '_').trim('_'); // this will make the name easier to read

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

export async function create(data) {
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
}

export function createFromVDDF(vddf, props) {
  return new Promise((resolve, reject) => {
    if (vddf.uuid) {
      resolve(vddf);
    } else {
      resolve(vddf.manager.export(vddf));
    }
  }).then(result => {
    return Storage.create({
        ...props,
      title: vddf.title,
      uuid: vddf.uuid,
      schema: vddf.schema,
      data: vddf.fetch()
    });
  });
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
