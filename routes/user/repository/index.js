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
  },

  findOneAndUpdateAction: async (id, actionType, options = {}) => {
    const user = await User.findOne({ _id: id });
    if (!user) {
      return null;
    }
    let { action_counters } = user;
    if (!action_counters) {
      action_counters = {};
    }
    const previousValue = action_counters[actionType];
    action_counters[actionType] = previousValue ? previousValue + 1 : 1;
    const newTotalCounter = Object.values(action_counters).reduce((acc, value) => acc + value, 0);
    const updatedUser = await User.findOneAndUpdate(
      { _id: id },
      {
        ...options,
        $set: {
          ...options.$set,
          action_total_counter: newTotalCounter,
          action_counters,
        },
      });

    return updatedUser.value;
  }
};
