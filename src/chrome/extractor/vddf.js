import { getSource as getSvgSource } from 'src/browser/lib/svg-crowbar2-es6';

export function detect(document) {
  const sources = [].slice.call(document.querySelectorAll('.vddf-chart'))
          .filter(s => s.__vddf__)
          .map(s => ({node: s, vddf: s.__vddf__}));

  return sources;
}

export function preview(source) {
  const vddf = source.vddf;
  const node = source.node.querySelector('.adaviz-chart svg');

  if (node) {
    node.setAttribute('version', '1.1');
    node.setAttribute('xmlns', 'http://www.w3.org/2000/svg');

    const svgSource = getSvgSource(node);
    const svgRaw = svgSource.source[0];

    return {
        ...source,
      title: vddf.title,
      svg: svgRaw,
      previewUrl: 'data:image/svg+xml;base64,' + btoa(svgRaw)
    };
  } else {
    return {
      ...source,
      title: vddf.title
    };
  }
}

export function extract(source) {
  const vddf = source.vddf;

  // this will create a new vddf
  return Promise.resolve({
    schema: vddf.schema,
    data: vddf.fetch(),
    visualization: vddf.visualization
  });
}
