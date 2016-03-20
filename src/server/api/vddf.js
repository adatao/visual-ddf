import url from 'url';
import rp from 'request-promise';

function getEmbedCode(uuid, baseUri) {
  const link = `${baseUri}/vddf/${uuid}`;
  const embedCode = `<div data-vddf="${link}"></div>` +
          `<script type="text/javascript" src="${baseUri}/embed.js"></script>`;
  const image = `${link}.png`;

  return {
    uuid,
    link,
    image,
    embedCode
  };
}

export async function load(app, request, ctx) {
  let body = request.body;
  let requestedUri = body.uri;
  let bits = url.parse(requestedUri);
  let pathname = bits.pathname;
  let vddf;

  // 1st try our own manager
  if (/\/vddf\/[a-zA-Z0-9\-]+/.test(pathname) && !/\.csv/.test(pathname)) {
    const uuid = pathname.split('/').pop();

    vddf = await app.manager.get(uuid);
  } else {
    // TODO: this may expose a loop hole to allow attacker to abuse
    // vddf server to request to any other site, we should think about how to
    // prevent this hole when deploy to production

    try {
      vddf = await app.manager.load(requestedUri);
    } catch (ex) {
      console.log(ex.stack);
    }
  }

  if (vddf) {
    return {
      status: 'success',
      result: vddf
    };
  } else {
    return {
      error: {
        message: 'URI is not supported'
      }
    };
  }
}

export async function get(app, request, ctx) {
  const uuid = ctx.params.uuid;
  if (!uuid) throw new Error('Uuid is required');

  return {
    status: 'success',
    result: await app.manager.get(uuid)
  };
}

export async function embed(app, request, ctx) {
  const uuid = ctx.params.uuid;
  if (!uuid) throw new Error('Uuid is required');

  // make sure the vddf is available
  await app.manager.get(uuid);

  return {
    status: 'success',
    result: getEmbedCode(uuid, request.origin)
  };
}

export async function create(app, request) {
  let body = request.body;

  // make sure all parameters are available
  if (typeof body !== 'object') {
    throw new Error('Post body is not valid');
  } else if (!body.data) {
    throw new Error('Not enough parameter');
  }

  let vddf = await app.manager.create(body);

  return {
    status: 'success',
    result: getEmbedCode(vddf.uuid, request.origin)
  };
}

export async function update(app, request, ctx) {
  const uuid = ctx.params.uuid;
  let body = request.body;

  if (!body) {
    throw new Error('Post body is invalid');
  }

  let vddf = await app.manager.get(uuid);

  // only pick a few fields to update from body
  ['title', 'schema', 'data', 'visualization'].forEach(f => {
    if (body[f]) {
      vddf[f] = body[f];
    }
  });

  await app.manager.update(vddf);

  return {
    status: 'success',
    result: vddf
  };
}
