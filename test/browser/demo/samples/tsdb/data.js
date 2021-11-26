// const TsdbDataClient = require('@baiducloud/sdk').TsdbDataClient;
// const config = {
//     endpoint: 'https://<databaseName>.tsdb.iot.<region>.baidubce.com',   // 用户的时序数据库域名，形式如 http://{databaseName}.tsdb.iot.<region>.baidubce.com
//     credentials: {
//         ak: '',             //您的AccessKey
//         sk: ''              //您的SecretAccessKey
//     }
// };

//沙盒
const AK = '70cf80e491d848799402fcaaacbf4378'
const SK = 'eb10b99a1b0e4ad59a985bc39612af85'
const ENDPOINT = 'http://10.136.187.32:8015'
const DATABASE = 'test0001'

//公有云
// const AK = '9b31328014c64d39a104e46c7d9532d2'
// const SK = 'c2f663c4c8ad447193cc4000f87c48e1'
// const ENDPOINT = 'http://testnode.tsdb.iot.gz.baidubce.com'


const TsdbDataClient = require('../../../../../src/tsdb_data_client');
const config = {
    endpoint: ENDPOINT,   // 用户的时序数据库域名，形式如 http://{databaseName}.tsdb.iot.<region>.baidubce.com
    credentials: {
        ak: AK,             //您的AccessKey
        sk: SK              //您的SecretAccessKey
    }
};

let client = new TsdbDataClient(config, DATABASE);
console.log(client,'--------')
function writeDemo() {
    // 构建想要写入的datapoints
    const datapoints = [
        {
            "metric": "cpu_idle",
            "field": "test",
            "tags": {
                "host": "server1",
                "rack": "rack1"
            },
            "timestamp": new Date().getTime(),
            "value": 51
        }
    ];
    // 获取并返回结果
    return client.writeDatapoints(datapoints)
        .then(response => console.log("write success!"))         // 获取成功
        .catch(error => console.error(error));           // 获取失败，并返回错误类型
}

function getMetricsDemo() {
    // 获取并打印Metric
    client.getMetrics()
        .then(response => console.log(response.body))        // 获取成功
        .catch(error => console.error(error));               // 获取失败，并返回错误类型
}

function queryDatapointsDemo() {
    // 构建想要查询的queryList
    const queryList = [{
        "metric": "cpu_idle",
        "field": "test",
        "tags": ["rack"],
        "filters": {
            "start": "1 hour ago",
            "tags": {
                "host": [
                    "server1",
                    "server2"
                ]
            },
            "value": ">= 10"
        },
        "groupBy": [
            {
                "name": "Tag",
                "tags": [
                    "rack"
                ]
            }
        ]
    }];

    // 获取并打印查询结果
    client.getDatapoints(queryList)
        .then(response => {
            console.log(JSON.stringify(response.body));
        }).catch(error => {
            console.error(error)
        });
}

function queryWithPageDemo(){
    // 构建想要查询的query
    var query = {
        "metric": "cpu_idle",
        "field": "test",
        "filters": {
            "start": "1 month ago",
        },
        "limit": 1
    };
    var fetchNext = nextMarker => {
        query.marker = nextMarker;                             // 设置marker，以便获取后面的数据
        client.getDatapoints([query])                          // 获取数据
            .then(deealWithResponse)                           // 设置处理结果的callback
            .catch(dealWithError);                             // 设置处理error的callback
    };
    var deealWithResponse = response => {                      // 处理结果
        console.log(JSON.stringify(response.body))             // 打印结果
        if (response.body.results[0].truncated) {              // 后面还有数据
            fetchNext(response.body.results[0].nextMarker);    // 获取下一页
        }
    }
    var dealWithError = error => console.error(error);         // 处理error

    client.getDatapoints([query])                             // 获取数据
        .then(deealWithResponse)                               // 设置处理结果的callback
        .catch(dealWithError);                                 // 设置处理error的callback
}

function queryWithSqlDemo(){
    var sql = 'select * from cpu_idle';
    client.getRowsWithSql(sql)
        .then(function (response) {
            console.log(response.body);
        });
}
writeDemo().then(() => {
    getMetricsDemo();
    queryDatapointsDemo();
    queryWithPageDemo();
    queryWithSqlDemo();
})