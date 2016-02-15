import koaRouter from 'koa-router';
import koaBodyParser from 'koa-body-parser';
import koaStatic from 'koa-static';
import fs from 'fs-promise';
import swig from 'swig';

export default function setupRoutes(app) {
  let router = koaRouter();

  function getBaseScriptUrl(script, origin, version) {
    return process.env.NODE_ENV === 'production' ?
      `${origin}/build/${script}` + (version ? `?v=${version}` : '') :
      `http://localhost:8080/build/${script}`;
  }

  router.get('/', async function() {
    const template = swig.renderFile(`${app.rootDir}/templates/home.html`, {
      scriptUrl: getBaseScriptUrl('webapp.js', this.request.origin)
    });

    this.body = template;
  });

  router.get('/vddf/:uuid', async function() {
    this.set('Access-Control-Allow-Origin', '*');

    let [ uuid, type ] = this.params.uuid.split('.');

    if (type === 'png') {
      let vddf = await app.manager.get(uuid);
      let imageFile = await app.manager.render(vddf);

      this.set('Content-Type', 'image/png');
      this.body = await fs.readFile(imageFile);
    } else if (type === 'json') {
      try {
        let vddf = await app.manager.get(uuid);

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
      const template = swig.renderFile(`${app.rootDir}/templates/embed.html`, {
        uuid: this.params.uuid,
        uri: `${this.request.origin}/vddf/${this.params.uuid}`,
        mode: this.query.mode
      });

      this.body = template;
    }
  });

  router.get('/embed.js', async function() {
    const version = app.config.version;
    const origin = this.request.origin;
    const scriptUrl = getBaseScriptUrl('embed.js', origin, version);

    this.set('Content-Type', 'text/javascript');
    this.body = swig.renderFile(`${app.rootDir}/templates/embed.js`, {
      baseUrl: origin,
      scriptUrl
    });
  });

  app
    .use(koaStatic(app.rootDir + '/assets'))
    .use(koaBodyParser())
    .use(router.routes())
    .use(router.allowedMethods());
}
