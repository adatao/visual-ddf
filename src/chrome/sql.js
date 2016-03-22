// knex does not work :(, so i build the sql alone here

let db = openDatabase('vddf', '1.0', 'DDF Storage', 100*1024*1024);

function isNumeric(n) {
  return !isNaN(parseFloat(n)) && isFinite(n);
}

export function quote(s) {
  if (s === null || s === undefined) {
    return 'null';
  } else if (isNumeric(s)) {
    return s + '';
  } else if (s instanceof Date) {
    // YYYY-MM-DD HH:II:SS format
    return "'" + s.toISOString().substring(0,22).replace('T', ' ') + "'";
  } else {
    return  "'" + (s+'')
      .replace(/'/g, "\\'")
      + "'";
  }
}

export function insert(table, data) {
  let fields = Object.keys(data).map(s => `'${s}'`).join(', ');
  let values = Object.keys(data).map(s => data[s])
        .map(s => quote(s)).join(', ');
  let sql = `insert into ${table} (${fields}) values (${values});`;

  return run(sql);
}

export function batchInsert(table, schema, rows) {
  return new Promise((resolve, reject) => {
    let fields = schema.map(s => `'${s}'`).join(', ');
    let placeholders = schema.map(s => '?').join(', ');
    let query = `insert into ${table} (${fields}) values (${placeholders});`;

    db.transaction((tx) => {
      console.debug('Batch insert: ', query, rows.length);

      for (let i = 0; i < rows.length; i++) {
        tx.executeSql(query, rows[i], null, (tx, error) => {
          console.log(error);
        });
      }

      resolve(rows.length);
    });
  });
}

export function run(sql, params) {
  console.debug('SQL:', sql, params);
  return new Promise((resolve, reject) => {
    db.transaction((tx) => {
      try {
        tx.executeSql(sql, params || [], (tx, results) => {
          resolve(results);
        }, (tx, error) => {
          reject(error);
        });
      } catch (ex) {
        reject(ex);
      }
    });
  });
}
