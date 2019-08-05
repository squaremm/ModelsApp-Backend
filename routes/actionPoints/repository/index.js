const db = require('../../../config/connection');

let ActionPoints;
db.getInstance((p_db) => {
  ActionPoints = p_db.collection('actionPoints');
});

module.exports = {
  /***
   * 
   * @param {str} provider one of 'instaStories', 'instaPost', 'fbPost', 'tripAdvisorPost', 'gPost', 'yelpPost'
   * 
   * @returns {object | null} object from database
   * 
   */
  findOne: (provider) => {
    return new Promise((resolve, reject) => {
        ActionPoints.findOne({ provider }, (error, ap) => {
          if (error) return reject(error);
          return resolve(ap);
        });
      });
    },
  
  find: (id, provider) => {
    return new Promise((resolve, reject) => {
      ActionPoints.find(
        {
        ...(id && { id }),
        ...(provider && { provider }),
        }).toArray((err, actionPoints) => {
          if (err) reject(err);
          resolve(actionPoints);
        });
      });
  },

  updateOrCreate(provider, points) {
    return new Promise((resolve, reject) => {
      ActionPoints.findOneAndUpdate(
        {
          provider,
        },
        {
          $set: { provider, points }
        },
        {
          returnOriginal: false,
          returnNewDocument: true,
          upsert: true,
          new: true,
        },
        (error, result) => {
          if (error) reject(error);
          resolve(result);
        },
      );
    });
  }
};
