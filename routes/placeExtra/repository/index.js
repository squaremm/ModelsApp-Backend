const newPlaceExtraRepository = (model) => ({
  updateOrCreate({ type, name, image }) {
    return new Promise((resolve, reject) => {
      model.findOneAndUpdate(
        {
          type,
          name,
        },
        {
          $set: {
            type,
            name,
            ...(image && { image }),
          }
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

  find: ({ id, name, type }, options) => {
    return new Promise((resolve, reject) => {
      model.find(
        {
        ...(id && { _id: id }),
        ...(name && { name }),
        ...(type && { type })
        },
        options
      ).toArray((err, actionPoints) => {
          if (err) reject(err);
          resolve(actionPoints);
        });
      });
  },

  findOne: (name) => {
    return model.findOne({ name });
  }
});

module.exports = newPlaceExtraRepository;