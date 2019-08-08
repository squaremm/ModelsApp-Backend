const newPlaceTypeRepository = (model) => ({
  updateOrCreate(type, image) {
    return new Promise((resolve, reject) => {
      model.findOneAndUpdate(
        {
          type,
        },
        {
          $set: { type, image }
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
  },

  find: ({ id, type }, options) => {
    return new Promise((resolve, reject) => {
      model.find(
        {
        ...(id && { _id: id }),
        ...(type && { type }),
        },
        options
      ).toArray((err, actionPoints) => {
          if (err) reject(err);
          resolve(actionPoints);
        });
      });
  },

  findOne: (type) => {
    return model.findOne({ type });
  }
});

module.exports = newPlaceTypeRepository;
