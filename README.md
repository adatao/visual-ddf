### Installation ###

You will need Node 4.x+ to run vddf-server properly. 

  * Use `npm install` to install all the dependencies.
  * Run `./scripts/install_adaviz.sh` to clone and compile adaviz.
  * Run `npm run dev` to start vddf-server on port 5001.

### Chrome Extension Development ###

Chrome extension is auto built when you run `npm run dev`. You can [load the extension](https://developer.chrome.com/extensions/getstarted#unpacked) from `build/chrome`.

**Important**: in development mode, you will need to configure the extension to use local vddf-server. Please visit the Chrome Extension page, then click on **Options** link and set VDDF Server to `http://localhost:5001`.

### Deployment  ###

  * Run `npm run build` to build all assets for production
  * Run `NODE_ENV=production npm start` to start server

By default, vddf-server will use the configuration provided in `config.json`, you can also override the config file with `CONFIG_FILE` environment variable.

For production environment, you should switch storage from sqlite to mysql. You can do it by edit the `database` section in `config.json`. Below is an example for configuration with mysql:

```
...
  database: {
    client: 'mysql',
    connection: {
      host     : '127.0.0.1',
      user     : 'your_database_user',
      password : 'your_database_password',
      database : 'myapp_test'
    }
  }
...
```

For some linux distro, you may need to install **libfontconfig** to make phantomjs works.

### Testing with BigApps ###

  * Check out branch **visual-ddf-integration** in BigApps
  * Visit BigApps, then use SQ/SQL to create any chart.
    * Click on the menu icon, then choose Export.
    * BigApps will give you the embeded code for the vDDF.
  * Chart rendered by codecell is also exportable.

Khang test
