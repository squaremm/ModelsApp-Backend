const { MongoClient } = require('mongodb');
const config = require('./index');
const url = config.mongoURI;

function MongoPool(){}

let p_db;

const initPool = async (cb) => {
  MongoClient.connect(url, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  }, function(err, client) {
    const db = client.db();
    if (err) throw err;

    p_db = db;
    if(cb && typeof(cb) == 'function') cb(p_db);
  });
  return MongoPool;
}

MongoPool.initPool = initPool;

function getInstance(cb){
  if(!p_db){
    initPool(cb);
  }
  else{
    if(cb && typeof(cb) == 'function') cb(p_db);
  }
}
MongoPool.getInstance = getInstance;

module.exports = MongoPool;
