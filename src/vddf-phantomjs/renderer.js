import phantomjs from 'phantomjs-prebuilt';
import childProcess from 'child_process';
import fs from 'fs-promise';

function exec(binPath, args) {
  return new Promise((resolve, reject) => {
    childProcess.execFile(binPath, args, (err, stdout, stderr) => {
      if (err) reject(err);
      else resolve({
        stdout: stdout,
        stderr: stderr
      });
    });
  });
}

async function unlink(file) {
  try {
    await fs.unlink(file);
  } catch (ex) {
    // ignore
  }
}

/**
 * Render a vDDF to an image using phantomjs
 *
 * This renderer assumes that there is already a client side
 * renderer and this renderer job is only capture it to an image
 */
export default class PhantomJsRenderer {
  constructor(config) {
    this.config = config;

    if (!this.config.outputDir) {
      this.config.outputDir = `${config.rootDir}/assets/charts`;
    }
  }

  async render(vddf) {
    const outputFile = `${this.config.outputDir}/${vddf.uuid}.png`;

    if (await fs.exists(outputFile)) {
      return outputFile;
    }

    const tmpFile = `${this.config.outputDir}/tmp-${vddf.uuid}.png`;
    await unlink(tmpFile);

    const args = [
      `${this.config.rootDir}/scripts/phantom-screenshot.js`,
      `${this.config.baseUrl}/vddf/${vddf.uuid}?mode=chartonly`,
      tmpFile,
      '1400px*1000px', // the chart is always rendered at 700x500
      2
    ];

    // TODO: add timeout
    try {
      const result = await exec(phantomjs.path, args);

      if (!result.stderr) {
        await fs.rename(tmpFile, outputFile);
        return outputFile;
      } else {
        throw new Error(`Fail to render: ${result.stderr}`);
      }
    } catch (ex) {
      console.log(ex.stack);
      await unlink(tmpFile);
      throw ex;
    }
  }
}
