const newOfferRepository = (model) => ({
  findOne: async (id) => {
    return model.findOne({ _id: id });
  },
})

module.exports = newOfferRepository;
