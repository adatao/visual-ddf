export function detect(document) {
  // TODO: search for csv link
  const sources = [];

  const Atags = document.querySelectorAll('a');
  for (let i = 0; i < Atags.length; i++) {
    const Atag = Atags[i];
    const pathname = Atag.pathname;

    if (/\.csv\??/i.test(pathname)) {
      let fileName = pathname.split('/').pop().replace(/\?.*$/, '');

      if (fileName === 'rows.csv') {
        fileName = window.title.split('-')[0].trim();
      }

      sources.push({
        title: fileName,
        dataUrl: Atag.href
      });
    }
  }

  return sources;
}

export function preview(source) {
  return source;
}

export function extract(source) {
  return Promise.resolve(source);
}
