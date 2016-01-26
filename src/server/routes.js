import koaRouter from 'koa-router';
import koaBodyParser from 'koa-body-parser';
import koaStatic from 'koa-static';
import fs from 'fs-promise';
import swig from 'swig';

export default function setupRoutes(app) {
  let router = koaRouter();

  router.get('/', async function() {
    this.body = 'Hello world';
  });

  router.get('/vddf/:uuid', async function() {
    let [ uuid, type ] = this.params.uuid.split('.');

    let vddf = await app.registry.load(uuid);

    if (type === 'json') {
      if (!vddf) {
        this.response.statusCode = 404;
        this.response = {
          error: {
            message: 'VDDF is not available'
          }
        };
      }

      this.body = {
        uuid: vddf.uuid,
        data: vddf.data,
        schema: vddf.schema,
        visualization: vddf.visualization
      };
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
