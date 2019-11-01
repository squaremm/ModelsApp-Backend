const fs = require('fs');
const moment = require('moment');

const downloadDatabase = async (entities) => {
  const dirname = moment().format('YYYY-MM-DD');
  const directory = `migrations/db/${dirname}`;
  for (entity of Object.keys(entities)) {
    const data = await entities[entity].find({}).toArray();
    if (!fs.existsSync(directory)){
      fs.mkdirSync(directory);
    }
    fs.writeFile(`${directory}/${entity}`, JSON.stringify(data), (err) => {
      if (err) console.log(err);
      console.log(`${entity} downloaded`);
    });
  }
};

module.exports = downloadDatabase;
