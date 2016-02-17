import PapaParse from 'papaparse';

/**
 * Load a vDDF from a browser File
 */
export default class FileLoader {
  /**
   * Return true if the source is supported
   */
  isSupported(source) {
    const isFileReaderSupported = window.File && window.FileReader && window.Blob;
    const file = Array.isArray(source) ? source[0] : source;

    return (
      isFileReaderSupported && file instanceof window.File
    );
  }

  /**
   * Load the file and return a vDDF
   */
  async load(source, manager) {
    const file = Array.isArray(source) ? source[0] : source;


    // only support csv file
    if (!/\.csv$/.test(file.name)) {
      throw new Error('Only csv file is supported');
    }

    // assume file always has header
    const result = await this.readCsvFile(file);
    const schema = result.data[0].map(c => ({name: c || 'id'}));
    const data = result.data.slice(1, result.data.length);

    return manager.create(null, 'local://' + file.name, {
      schema: schema,
      data: data
    });
  }

  readCsvFile(file) {
    return new Promise((resolve, reject) => {
      // let reader = new window.FileReader();

      // reader.onload = (e) => {
      //   resolve(e.target.result);
      // };

      // reader.onerror = (e) => {
      //   reject(e.target.error);
      // };

      // reader.readAsText(file);

      PapaParse.parse(file, {
        error: (err, file, inputElm, reason) => {
          console.log(err);
          reject(err);
        },
        complete: (result) => {
          if (result.errors.length) {
            reject(result.errors[0]);
          } else {
            resolve(result);
          }
        }
      });
    });
  }
}
