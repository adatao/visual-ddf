import UUID from 'uuid';
import { Types } from '../vddf/schemadetector';

/**
 * vDDF Storage using knex
 */
export default class DbStorage {
  constructor(db) {
    this.db = db;
  }

  init() {
    return this.db.schema.hasTable('vddf')
      .then((exists) => {
        return !exists ? this.db.schema.createTableIfNotExists('vddf', (table) => {
          table.increments('id');
          table.uuid('uuid').unique();
          table.text('title');
          table.text('source');
          table.json('data');
          table.json('schema');
          table.json('visualization');
        }) : null;
      });
  }

  async create(vddf) {
    vddf.uuid = UUID.v4();

    // create a vddf record
    await this.db.table('vddf').insert(this._serialize(vddf));

    // does not work well yet :(
    // await this.createTable(vddf);

    return vddf.uuid;
  }

  async get(uuid) {
    const row = await this.db.table('vddf').select('*')
          .where('uuid','=',uuid);

    return row.length ? this._deserialize(row[0]) : null;
  }

  async update(vddf) {
    const row = this._serialize(vddf);
    const affectedRows = await this.db.table('vddf').where({
      uuid: row.uuid
    }).update(row);

    return vddf.uuid;
  }

  async remove(uuid) {
    throw new Error('Not supported');
  }

  query(sql) {
    // TODO: this is dangerous!

    // TODO: replace table name

    return this.db.raw(sql).then(result => {
      return result[0];
    });
  }

  async createTable(vddf) {
    const tableName = 'vddf_' + vddf.uuid.replace(/-/g, '_');
    return this.db.schema.createTableIfNotExists(tableName, (table) => {
      vddf.schema.forEach(c => {
        switch (c.type) {
        case Types.Integer:
          table.integer(c.name);
          break;
        case Types.Float:
          table.float(c.name);
          break;
        default:
          table.text(c.name);
        }
      });
    }).then(() => {
      // we can't use batchInsert, so i will just do it by myself here
      // see https://github.com/colonyamerican/mock-knex/issues/21

      return Promise.all(vddf.data.map(r => {
        const record = {};

        vddf.schema.forEach((c,i) => {
          record[c.name] = r[i];
        });

        return this.db.table(tableName).insert(record);
      }));
    });
  }

  _serialize(vddf) {
    return {
      uuid: vddf.uuid,
      title: vddf.title,
      source: vddf.source,
      data: JSON.stringify(vddf.data),
      schema: JSON.stringify(vddf.schema),
      visualization: JSON.stringify(vddf.visualization)
    };
  }

  _deserialize(row) {
    return {
      uuid: row.uuid,
      title: row.title,
      source: row.source,
      data: JSON.parse(row.data),
      schema: JSON.parse(row.schema),
      visualization: JSON.parse(row.visualization)
    };
  }
}
