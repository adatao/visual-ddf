import knex from 'knex';
import Manager from './manager';

export default function setupDatabase(app) {
  app.db = knex(app.config.database);

  app.db.schema.hasTable('vddf')
    .then((exists) => {
      return !exists ? app.db.schema.createTableIfNotExists('vddf', (table) => {
        table.increments('id');
        table.uuid('uuid').unique();
        table.text('title');
        table.text('source');
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

  app.manager = new Manager(app.db);
};
