const newUserRepository = (model) => ({
  findOne: (id) => {
    return model.findOne({ _id: id });
  },

  findOneAndUpdateAction: async (id, actionType, options = {}) => {
    const user = await model.findOne({ _id: id });
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
    const updatedUser = await model.findOneAndUpdate(
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
});

module.exports = newUserRepository;
