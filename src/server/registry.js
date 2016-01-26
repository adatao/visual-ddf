import uuid from 'uuid';

export default class DbRegistry {
  constructor(db) {
    this.db = db;
  }

  async create(vddf) {
    const newUuid = uuid.v4();

    // additional validation
    if (vddf.data.length === 0) {
      throw new Error('vDDF data can not be empty');
    } else if (vddf.schema.length === 0) {
      throw new Error('Schema can not be empty');
    } else {
      let rowId;
      let schemaLength = vddf.schema.length;

      // make sure all rows have same size with schema
      vddf.data.some((d, i) => {
        if (d.length !== schemaLength) {
          rowId = i;
          return true;
        }

        return false;
      });

      if (rowId !== undefined) {
        throw new Error(`Data is mismatch at row ${rowId}.`);
      }
    }

    await this.db.table('vddf').insert({
      uuid: newUuid,
      data: JSON.stringify(vddf.data),
      schema: JSON.stringify(vddf.schema),
      visualization: JSON.stringify(vddf.visualization)
    });

    return newUuid;
  }

  async load(uuid) {
    let row = await this.db.table('vddf').select('*')
          .where('uuid','=',uuid);

    if (!row.length) {
      throw new Error('vDDF is not available');
    }

    return {
      uuid: row[0].uuid,
      data: JSON.parse(row[0].data),
      schema: JSON.parse(row[0].schema),
      visualization: JSON.parse(row[0].visualization)
    };
  }
}
