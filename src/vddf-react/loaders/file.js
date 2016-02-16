/**
 * Load a vDDF from a browser File
 */
export default class FileLoader {
  /**
   * Return true if the source is supported
   */
  isSupported(source) {
    const isFileReaderSupported = window.File && window.FileReader && window.Blob;

    return (
      isFileReaderSupported && source instanceof window.File
    );
  }

  /**
   * Load the file and return a vDDF
   */
  async load(source) {
    const content = await this.readFile(source);
  }

  readFile(file) {
    return new Promise((resolve, reject) => {
      let reader = new window.FileReader();

      reader.onLoad = (e) => {
        resolve(e.target.result);
      };

      reader.onerror = (e) => {
        reject(e.target.error);
      };

      reader.readAsText(file);
    });
  }
}
