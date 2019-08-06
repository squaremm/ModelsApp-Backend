const db = require('../../../config/connection');

let Offer;
db.getInstance((p_db) => {
  Offer = p_db.collection('offers');
});

module.exports = {
  findOne: async (id) => {
    return await new Promise((resolve, reject) => {
        Offer.findOne({ _id: id }, (error, result) => {
          if (error) return reject(error);
          return resolve(result);
        });
      });
  }
};
