const validatePlaceOffers = async (placeOffer, placeRepository) => {
  const place = await placeRepository.findOne(placeOffer.placeId);
  if (!place) {
    throw new Error(`No place with id ${placeOffer.placeId}`);
  }
  for (const offerId of placeOffer.offerIds) {
    if (!place.offers.find(oid => oid === offerId)) {
      throw new Error(`Place ${placeOffer.placeId} does not have offer ${offerId}`);
    }
  }

  return true;
}

module.exports = validatePlaceOffers;