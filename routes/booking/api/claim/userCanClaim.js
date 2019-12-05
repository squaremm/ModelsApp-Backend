const moment = require('moment');

const userCanClaim = (user, booking, requiredCredits) => {
  if (booking.claimed) {
    return {
      value: false,
      message: 'Booking has already been claimed',
    }
  }

  if (user.credits < requiredCredits) {
    return {
        value: false,
        message: 'Not enough credits',
    }
  }

  const bookingDate = moment(`${booking.date} ${booking.endTime}`, 'DD-MM-YYYY h.mm')
    .add({ minutes: 10 });

  if (moment().isAfter(bookingDate)) {
    return {
      value: false,
      message: "Cannot claim, it's too late",
    }
  }

  const bookingDateStart = moment(`${booking.date} ${booking.startTime}`, 'DD-MM-YYYY h.mm');

  if (moment.duration(bookingDateStart.diff(moment())).asMinutes() > 10) {
    return {
      value: false,
      message: "Cannot claim, it's too early",
    }
  }

  return {
    value: true,
    message: '',
  }
};

module.exports = userCanClaim;
