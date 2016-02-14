import url from 'url';
import rp from 'request-promise';
import Baby from 'babyparse';

async function loadFromCsv(manager, data, source) {
  const parsed = Baby.parse(data, {
    header: true
  });

  const uuid = await manager.create({data: parsed.data, source});

  return await manager.get(uuid);
}

function getEmbedCode(uuid, baseUri) {
  const uri = `${baseUri}/vddf/${uuid}`;
  const embedCode = `<div data-vddf="${uri}"></div>` +
          `<script type="text/javascript" src="${baseUri}/embed.js"></script>`;

  return {
    uuid,
    uri,
    embedCode
  };
}

export async function load(app, request, ctx) {
  let body = request.body;
  let requestedUri = body.uri;
  let bits = url.parse(requestedUri);
  let vddf;

  // 1st try our own manager
  if (/\/vddf\/[a-zA-Z0-9\-]+/.test(bits.pathname)) {
    const uuid = bits.pathname.split('/').pop();

    vddf = await app.manager.get(uuid);
  } else {
    // TODO: this may expose a loop hole to allow attacker to abuse
    // vddf server to request to any other site, we should think about how to
    // prevent this hole when deploy to production
    // we also need to think about caching strategy too, do we always want to
    // return the same vddf or create new for each load ?

    // 2nd try load the csv file, only support file with headers for now
    try {
      let response = await rp(requestedUri, {resolveWithFullResponse: true});
      vddf = await loadFromCsv(app.manager, response.body, requestedUri);
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

  const vddfUuid = await app.manager.create(body);

  return {
    status: 'success',
    result: getEmbedCode(vddfUuid, request.origin)
  };
}
