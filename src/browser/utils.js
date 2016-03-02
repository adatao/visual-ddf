export function generateDataUrl(type, data) {
  return `data:${type}:charset=utf-8,` + encodeURIComponent(data);
}

export function downloadData(filename, type, data) {
  let link = document.createElement('a');
  link.download = filename;
  link.href = generateDataUrl(type, data);
  link.click();
}
