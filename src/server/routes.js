import koaRouter from 'koa-router';
import koaBodyParser from 'koa-body-parser';
import koaStatic from 'koa-static';
import fs from 'fs-promise';
import swig from 'swig';

export default function setupRoutes(app) {
  let router = koaRouter();

  router.get('/', async function() {
    this.body = 'VDDF Server 1.0.0';
  });

  router.get('/vddf/:uuid', async function() {
    this.set('Access-Control-Allow-Origin', '*');

    let [ uuid, type ] = this.params.uuid.split('.');

    if (type === 'json') {
      try {
        let vddf = await app.registry.load(uuid);

        this.body = vddf;
      } catch (ex) {
        this.response.statusCode = 404;
        this.body = {
          error: {
            message: ex.message
          }
        };
      }
    } else {
      let template = swig.renderFile(`${app.rootDir}/templates/embed.html`, {
        uuid: this.params.uuid,
        uri: `${this.request.origin}/vddf/${this.params.uuid}`
      });

      this.body = template;
    }
  });

  app
    .use(koaStatic(app.rootDir + '/assets'))
    .use(koaBodyParser())
    .use(router.routes())
    .use(router.allowedMethods());
}
