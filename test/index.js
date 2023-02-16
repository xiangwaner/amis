
const BosClient = require('../').BosClient;
const config = require('./config');

console.log(config.bos);
const client = new BosClient(config.bos);

(async function () {})()
