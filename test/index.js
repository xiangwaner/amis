
const BosClient = require('../').BosClient;
const config = require('./config');
const client = new BosClient(config.bos);

(async function () {
    /** callback demo */
    const res = await client.putObjectFromString('amis-mock', 'str1', 'lurunze', {
        callback: {
            urls: ["https://www.test.com/callback"],
            vars: {name: 'baidu'}
        }
    });
})()
