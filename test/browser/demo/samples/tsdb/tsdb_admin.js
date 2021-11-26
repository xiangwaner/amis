var TsdbAdminClient = require('@baiducloud/sdk').TsdbAdminClient; 

const config = {
    endpoint: '',                // tsdb.{region}.baidubce.com
    credentials: {
        ak: '',             //您的AccessKey
        sk: ''              //您的SecretAccessKey
    }
};

// 初始化一个TsdbAdminClient
const client = new TsdbAdminClient(config);

function createDatabase() {
    // 实例的名字
    var databaseName = "test";
    // ClientToken, 用于保证幂等性，重试发送创建请求时，使用同一个clientToken
    var clientToken = 'fsdfe4g65h';
    // 实例描述，可不填写
    var description = 'This is just a test for TSDB.';
    var ingestDataPointsMonthly = 1;                       // 写入额度，单位：百万点/月
    var storeBytesQuota = 1;                               // 存储空间额度，单位：GB
    var purchaseLength = 1;                                // 购买时长，单位：月
    var couponName = "";                         // 代金券号，可不填写

    // 创建并返回创建结果
    client.createDatabase(clientToken, databaseName, ingestDataPointsMonthly, purchaseLength, description, couponName, storeBytesQuota)
    .then(response => console.log(response.body))       // 创建成功
    .catch(error => console.error(error));              // 创建失败，并返回错误类型
}

function deleteDatabase() {
    // 删除实例的ID
    var databaseId = 'tsdb-dvb9we5yfkcc';
    // 删除实例并返回结果
    client.deleteDatabase(databaseId)
        .then(response => console.log(response))         // 删除成功
        .catch(error => console.error(error));                   // 删除失败，并返回错误类型
}

function getAllDatabase() {
    client.listDatabase()
    .then(response => console.log(response.body))            // 获取成功，返回包含每个数据库的信息的列表
    .catch(error => console.error(error));                   // 删除失败，并返回错误类型
}

function getDatabaseInfo() {
    // 获取实例的ID
    var databaseId = 'tsdb-dvb9we5yfkcc';
    // 获取实例并返回实例信息
    client.getDatabaseInfo(databaseId)
        .then(response => console.log(response.body))            // 获取成功，返回信息列表
        .catch(error => console.error(error));                   // 获取失败，并返回错误类型
}

getAllDatabase()
