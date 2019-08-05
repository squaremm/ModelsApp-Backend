const db = require('../../../config/connection');

let User;
db.getInstance((p_db) => {
  User = p_db.collection('users');
});

module.exports = {
  findOne: (id) => {
    return new Promise((resolve, reject) => {
      User.findOne({ _id: id }, (err, user) => {
        if (err) {
          return reject(err);
        }
        return resolve(user);
      });
    });
  }
};
