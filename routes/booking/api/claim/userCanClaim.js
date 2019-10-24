const moment = require('moment');

const userCanClaim = (user, booking, requiredCredits) => {
  if (booking.claimed = true) {
    return {
      value: false,
      message: 'Booking has already been claimed',
    }
  }
  let creditsToPay = requiredCredits < 0 ? -requiredCredits : requiredCredits;

  if (user.credits < creditsToPay) {
    return {
        value: false,
        message: 'Not enough credits',
    }
  }

  const bookingDate = moment(`${booking.date} ${booking.startTime}`, 'DD-MM-YYYY h.mm')
    .subtract({ hours: 1 });

  if (moment().isAfter(bookingDate)) {
    return {
      value: false,
      message: 'Cannot claim, its too late',
    }
  }

  return {
    value: true,
    message: '',
  }
};

module.exports = userCanClaim;
