import koaRouter from 'koa-router';
import * as vddfApi from './vddf.js';

export default function setupApi(app) {
  const prefix = '/api';
  let router = koaRouter({
    prefix
  });

  router.use('/', function*(next) {
    try {
      this.set('Access-Control-Allow-Origin', '*');
      yield next;
    } catch (ex) {
      console.log(`API request error: ${ex.message}`);

      if (!this.body) {
        this.body = {
          error: {
            message: ex.message
          }
        };
      }
    }
  });

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

  // router.delete('/vddf/:uuid', async function() {
  //   this.body = await vddfApi.delete(app, this.request, this);
  // });

  app
    .use(router.routes())
    .use(router.allowedMethods());
}
