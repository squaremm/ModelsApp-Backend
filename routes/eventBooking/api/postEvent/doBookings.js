const moment = require('moment');

const ErrorResponse = require('../../../../core/errorResponse');

const doBookings = async (event, userId, bookings, bookingUtil) => {
  const bookingDetails = [];
  for (const booking of bookings) {
    const placeOffer = event.placesOffers.find(placeOffer => placeOffer.placeId === booking.placeId);
    if (!placeOffer) {
      throw ErrorResponse.BadRequest(`Place ${booking.placeId} is not part of event`);
    }
    if (moment(booking.date).isAfter(moment(event.timeframe.end))) {
      throw ErrorResponse.BadRequest(`Booking cannot happen after event finished`);
    }
    const details = await bookingUtil.bookPossible(booking.placeId, userId, booking.intervalId, moment(booking.date), true);
    bookingDetails.push({ booking, ...details });
  }

  const bookingIds = [];
  for (const details of bookingDetails) {
    const booking = await bookingUtil.book(
      details.booking.placeId,
      userId,
      details.fullDate,
      details.offers,
      details.chosenInterval,
      details.place,
      event._id,
    );
    bookingIds.push(booking._id);
  }
  return bookingIds;
};

module.exports = doBookings;