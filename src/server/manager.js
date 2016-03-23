import SchemaDetector from '../vddf/schemadetector';
import rp from 'request-promise';
import Baby from 'babyparse';

export default class Manager {
  constructor(storage) {
    this.storage = storage;
  }

  async create(vddf) {
    this._validate(vddf);
    vddf.uuid = await this.storage.create(vddf);

    return vddf;
  }

  async update(vddf) {
    this._validate(vddf);
    await this.storage.update(vddf);

    return vddf;
  }

  async render(vddf, ...params) {
    return await this.renderer.render(vddf, ...params);
  }

  async get(uuid) {
    let row = await this.storage.get(uuid);

    if (!row) {
      throw new Error('vDDF is not available');
    }

    return row;
  }

  /**
   * Create a vDDF from a sql query
   */
  query(sql) {
    return this.storage.query(sql);
  }

  async load(requestUri) {
    // TODO: we need to think about caching strategy too, do we always want to
    // return the same vddf or create new for each load ?

    // only support csv file with header as first row for now
    let response = await rp(requestUri, {resolveWithFullResponse: true});

    return this.loadFromCsv(response.body, requestUri);
  }

  async loadFromCsv(csv, source, extra = {}) {
    const parsed = Baby.parse(csv, {
      header: true
    });

    const vddf = await this.create({data: parsed.data, source, ...extra});

    return await this.get(vddf.uuid);
  }

  _validate(vddf) {
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

    return vddf;
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
}
