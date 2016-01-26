import knex from 'knex';
import DbRegistry from './registry';

export default function setupDatabase(app) {
  app.db = knex(app.config.database);

  app.db.schema.hasTable('vddf')
    .then((exists) => {
      return !exists ? app.db.schema.createTableIfNotExists('vddf', (table) => {
        table.increments('id');
        table.uuid('uuid', 255).unique();
        table.json('data');
        table.json('schema');
        table.json('visualization');
      }) : null;
    })
    .then((...args) => {
      console.log('Schema is init sucessfully');
    })
    .catch(err => {
      console.log(`There is an error while initing schema: ${err.stack}`);
    });

  app.registry = new DbRegistry(app.db);
};

