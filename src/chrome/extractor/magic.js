export function detect(document) {
  // TODO
}

export function preview(source) {
  
}

export function extract(node) {
  const location = window.location + '';

  if (/npr.org.*when-women-stopped-coding/.test(location)) {
    console.log('found npr');
  }
}
