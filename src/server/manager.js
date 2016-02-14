import uuid from 'uuid';
import SchemaDetector from '../vddf/schemadetector';

export default class Manager {
  constructor(db) {
    this.db = db;
  }

  async create(vddf) {
    const newUuid = uuid.v4();

    // additional validation
    if (vddf.data.length === 0) {
      throw new Error('vDDF data can not be empty');
    }

    if (!vddf.schema) {
      const schemaResult = this.constructor.extractSchema(vddf.data);
      vddf.data = schemaResult.data;
      vddf.schema = schemaResult.schema;
    }

    if (vddf.schema.length === 0) {
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

    // run one round of schema detection
    vddf.schema = (new SchemaDetector).detect(vddf.data, vddf.schema);

    // fallback to data table
    if (!vddf.visualization) {
      vddf.visualization = {
        type: 'datatable'
      };
    }

    await this.db.table('vddf').insert({
      uuid: newUuid,
      title: vddf.title,
      source: vddf.source,
      data: JSON.stringify(vddf.data),
      schema: JSON.stringify(vddf.schema),
      visualization: JSON.stringify(vddf.visualization)
    });

    return newUuid;
  }

  async get(uuid) {
    let row = await this.db.table('vddf').select('*')
          .where('uuid','=',uuid);

    if (!row.length) {
      throw new Error('vDDF is not available');
    }

    return this._deserializeRow(row[0]);
  }

  static extractSchema(data) {
    let schema = [];
    let newData = data.map(d => {
      const row = Object.values(d);

      if (schema.length === 0) {
        schema = Object.keys(d).map(f => {
          return {
            name: f
          };
        });
      }

      return row;
    });

    return {
      data: newData,
      schema: schema
    };
  }

  _deserializeRow(row) {
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
