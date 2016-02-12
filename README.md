### Installation ###

You will need Node 4.x+ to run vddf-server properly. 

  * Use `npm install` to install all the dependencies.
  * Run `./scripts/install_adaviz.sh` to clone and compile adaviz.
  * Run `npm run dev` to start vddf-server on port 5001.

### Deployment  ###

  * Run `npm run build` to build all assets for production
  * Run `NODE_ENV=production npm start` to start server

By default, vddf-server will use the configuration provided in `config.json`, you can also override the config file with `CONFIG_FILE` environment variable.

### Testing with BigApps ###

  * Check out branch **visual-ddf-integration** in BigApps
  * Visit BigApps, then use SQ/SQL to create any chart.
    * Click on the menu icon, then choose Export.
    * BigApps will give you the embeded code for the vDDF.
  * Chart rendered by codecell is also exportable.
