import knex from 'knex';
import Manager from './manager';
import PhantomJsRenderer from '../vddf-phantomjs/renderer';
import DbStorage from './storage';

export default function setupDatabase(app) {
  app.db = knex(app.config.database);

  let storage = new DbStorage(app.db);

  // init the storage before giving it to manager
  storage.init()
    .then((...args) => {
      console.log('Schema is init sucessfully');
    })
    .catch(err => {
      console.log(`There is an error while initing schema: ${err.stack}`);
    });

  app.manager = new Manager(storage);

  // use phantom renderer for server side, assume that the vddf will always available in the storage
  app.manager.renderer = new PhantomJsRenderer({
    rootDir: app.rootDir,
    baseUrl: `http://localhost:${app.config.port}`
  });
};
