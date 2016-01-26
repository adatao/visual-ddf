import koa from 'koa';
import setupDatabase from './db';
import setupRoutes from './routes';
import setupApi from './api';
import fs from 'fs';

let app = koa();
app.rootDir = process.cwd();
let configFile = process.env.CONFIG_FILE || `${app.rootDir}/config.json`;
app.config = JSON.parse(fs.readFileSync(configFile));

[ setupDatabase, setupRoutes, setupApi ].forEach(f => f(app));

app.listen(app.config.port);
console.log(`Server listens on port ${app.config.port}`);
