import url from 'url';
import rp from 'request-promise';
import Baby from 'babyparse';

async function loadFromCsv(registry, data, source) {
  const parsed = Baby.parse(data, {
    header: true
  });

  const uuid = await registry.create({data: parsed.data, source});

  return await registry.get(uuid);
}

export async function load(app, request, ctx) {
  let body = request.body;
  let requestedUri = body.uri;
  let bits = url.parse(requestedUri);
  let vddf;

  // 1st try our own registry
  if (/\/vddf\/[a-zA-Z0-9\-]+/.test(bits.pathname)) {
    const uuid = bits.pathname.split('/').pop();

    vddf = await app.registry.get(uuid);
  } else {
    // TODO: this may expose a loop hole to allow attacker to abuse
    // vddf server to load any other site, we should think about how to
    // prevent this hole when deploy to production
    // we also need to think about caching strategy too, do we always want to
    // return the same vddf or create new for each load ?

    // 2nd try load the csv file, only support file with headers for now
    try {
      let response = await rp(requestedUri, {resolveWithFullResponse: true});
      vddf = await loadFromCsv(app.registry, response.body, requestedUri);
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

  let vddf = await app.registry.get(uuid);

  return {
    status: 'success',
    result: vddf
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

  const vddfUuid = await app.registry.create(body);
  const baseUri = request.origin;
  const vddfUri = `${baseUri}/vddf/${vddfUuid}`;
  const embedCode = `<div data-vddf="${vddfUri}"></div>` +
          `<script type="text/javascript" src="${baseUri}/embed.js"></script>`;

  return {
    status: 'success',
    result: {
      uuid: vddfUuid,
      uri: vddfUri,
      embedCode: embedCode
    }
  };
}
