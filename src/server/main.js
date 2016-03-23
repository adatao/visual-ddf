import 'babel-polyfill';
import koa from 'koa';
import setupDatabase from './db';
import setupRoutes from './routes';
import setupApi from './api';
import fs from 'fs';
import bot from '../slack/bot';

let app = koa();
app.rootDir = process.cwd();
let configFile = process.env.CONFIG_FILE || 'config.json';
app.config = JSON.parse(fs.readFileSync(configFile));

console.log(`Reading config from ${configFile}`);

[ setupDatabase, setupRoutes, setupApi ].forEach(f => f(app));

app.listen(app.config.port);
console.log(`Server listens on port ${app.config.port}`);

// also start slackbot
if (app.config.slack && app.config.slack.token) {
  bot(app);
}

process.on('uncaughtException', (err) => {
  console.log(`Uncaught exception: ${err}`);
  process.exit(1);
});
