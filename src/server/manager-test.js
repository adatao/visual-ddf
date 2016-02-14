import Manager from './manager';
import { assert } from 'chai';
import sinon from 'sinon';
import knex from 'knex';
import mockDb from 'mock-knex';

describe('Manager', () => {
  let db;
  let tracker;
  let manager;

  beforeEach(() => {
    db = knex({ client: 'sqlite' });
    mockDb.mock(db);
    tracker = mockDb.getTracker();
    tracker.install();

    manager = new Manager(db);
  });

  afterEach(() => {
    tracker.uninstall();
    mockDb.unmock(db);
  });

  it('should create ddf successfully', async () => {
    // expect an insert query
    tracker.on('query', (query) => {
      // TODO: verify that data is json serialized
      // TODO: verify that schema is auto detected
      assert.equal('insert', query.method);

      query.response();
    });

    let uuid = await manager.create({
      data: [[1,2], [3,4]],
      schema: [{name: 'id'}, {name: 'value'}],
      visualization: {type: 'bar'}
    });

    assert.isNotNull(uuid);
  });

  it('should validate data correctly');

  it('should extract schema from data', () => {
    let detectResult = Manager.extractSchema([
      {test: 1}, {test: 2}
    ]);

    assert.lengthOf(detectResult.schema, 1);
    assert.equal(detectResult.schema[0].name, 'test');
    assert.lengthOf(detectResult.data, 2);
    assert.equal(2, detectResult.data[1][0]);
  });

  it('should load existing ddf', async() => {
    const checkUuid = '123';

    tracker.on('query', (query) => {
      assert.equal('select', query.method);
      assert.include(query.bindings, checkUuid);

      query.response([{
        uuid: checkUuid,
        data: '[[1,2],[3,4]]',
        schema: '[{"name": "id"}, {"name": "value"}]',
        visualization: '{"type": "bar"}'
      }]);
    });

    let ddf = await manager.get(checkUuid);
    assert.lengthOf(ddf.data, 2);
    assert.equal(3, ddf.data[1][0]);
    assert.equal('bar', ddf.visualization.type);
  });
});
