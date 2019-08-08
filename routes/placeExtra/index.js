const schema = require('./schema');

module.exports = (app, placeExtraRepository, validate) => {
  app.put('/api/place-extra', async (req, res) => {
    const validation = validate(req.body, schema);
    if (validation.error) {
      return res.status(400).json({ message: validation.error });
    }

    const { name, image } = req.body;
    let result;

    try {
      result = await placeExtraRepository.updateOrCreate(name, image);
    } catch (error) {
      return res.status(500).json({ message: 'Something went wrong' });
    }

    return res.status(200).send(result.value);
  });

  app.get('/api/place-extra', async (req, res) => {
    const { id, name } = req.query;
    let result;
    try {
      result = await placeExtraRepository.find({ id, name });
    } catch (error) {
      return res.status(500).json({ message: 'Something went wrong' });
    }

    return res.status(200).send(result);
  });
};

