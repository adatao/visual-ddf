import koaRouter from 'koa-router';
import * as vddfApi from './vddf.js';

export default function setupApi(app) {
  const prefix = '/api';
  let router = koaRouter({
    prefix
  });

  router.use('/', function*(next) {
    try {
      yield next;
    } catch (ex) {
      console.log(`API request error: ${ex.stack}`);

      if (!this.body) {
        this.body = {
          error: {
            message: ex.message
          }
        };
      }
    }
  });

  // enable cors for all api
  router.all('/*', function* (next) {
    this.set('Access-Control-Allow-Origin', '*');
    this.set('Access-Control-Allow-Headers', ['Content-Type']);

    yield next;
  });

  // don't enable query for now
  // router.post('/query', async function() {
  //   const result = await app.manager.query(this.request.body.sql);

  //   this.body = {
  //     status: 'success',
  //     result: result
  //   };
  // });

  // create new vddf by post
  router.post('/vddf/create', async function() {
    this.body = await vddfApi.create(app, this.request, this);
  });

  router.post('/vddf/load', async function() {
    this.body = await vddfApi.load(app, this.request, this);
  });

  router.get('/vddf/:uuid', async function() {
    this.body = await vddfApi.get(app, this.request, this);
  });

  router.get('/vddf/:uuid/embed', async function() {
    this.body = await vddfApi.embed(app, this.request, this);
  });

  // don't support delete
  // router.delete('/vddf/:uuid', async function() {
  //   this.body = await vddfApi.delete(app, this.request, this);
  // });

  // XXX: this one does not cover authentication yet
  // we need to think of a scheme where people can 
  router.post('/vddf/:uuid', async function() {
    this.body = await vddfApi.update(app, this.request, this);
  });

  app
    .use(router.routes())
    .use(router.allowedMethods());
}
