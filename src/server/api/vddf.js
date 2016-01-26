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
  if (!body.data || !body.visualization || !body.schema) {
    throw new Error('Not enough parameter');
  }

  const vddfUuid = await app.registry.create(body);

  return {
    status: "success",
    result: {
      uuid: vddfUuid,
      uri: `${request.origin}/vddf/${vddfUuid}`
    }
  };
}
