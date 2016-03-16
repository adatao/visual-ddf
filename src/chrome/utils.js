export function loadMaterialFonts() {
  // also add material icons resource
  let head = document.getElementsByTagName('head')[0];
  if (head) {
    let iconFont = document.createElement('link');
    iconFont.setAttribute('href', 'https://fonts.googleapis.com/icon?family=Material+Icons');
    iconFont.setAttribute('rel', 'stylesheet');

    head.appendChild(iconFont);
  }
}
