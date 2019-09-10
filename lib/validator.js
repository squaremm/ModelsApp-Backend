const newValidator = () => (body, schema) => {
  const validation = schema.validate(body);
  if (validation.error) {
    const error = validation.error.details.reduce((acc, val) => `${acc}${val.message}`, '');
    return { error };
  }

  return {};
}

module.exports = newValidator;
