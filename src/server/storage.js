import UUID from 'uuid';

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
        return !exists ? app.this.schema.createTableIfNotExists('vddf', (table) => {
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
    await this.db.table('vddf').insert(this._serialize(vddf));

    return vddf.uuid;
  }

  async update(vddf) {
    // TODO
  }

  async get(uuid) {
    let row = await this.db.table('vddf').select('*')
          .where('uuid','=',uuid);

    return row.length ? this._deserialize(row[0]) : null;
  }

  async remove(uuid) {
    // TODO
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
