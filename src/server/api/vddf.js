export async function get(app, request, ctx) {
  const uuid = ctx.params.uuid;
  if (!uuid) throw new Error('Uuid is required');

  let vddf = await app.registry.load(uuid);

  return {
    status: "success",
    result: vddf
  };
}

export async function create(app, request) {
  let body = request.body;

  // make sure all parameters are available
  if (!body.data) {
    throw new Error('Not enough parameter');
  }

  const vddfUuid = await app.registry.create(body);
  const baseUri = request.origin;
  const vddfUri = `${baseUri}/vddf/${vddfUuid}`;
  const embedCode = `<div data-vddf="${vddfUri}"></div>` +
          `<script type="text/javascript" href="${baseUri}/assets/vddf.js"></script>`;

  return {
    status: "success",
    result: {
      uuid: vddfUuid,
      uri: vddfUri,
      embedCode: embedCode
    }
  };
}
