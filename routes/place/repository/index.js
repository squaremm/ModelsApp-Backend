const newPlaceRepository = (model) => ({
  findOne: (id) => {
    return model.findOne({ _id: id });
  },

  find: (query, options) => {
    return model.find(query, options).toArray();
  },
});

module.exports = newPlaceRepository;
