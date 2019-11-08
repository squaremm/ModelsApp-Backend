exports.SUBSCRIPTION = Object.freeze({
  trial: 'Trial',
  basic: 'Basic',
  premium: 'Premium',
  unlimited: 'Unlimited',
});

exports.SUBSCRIPTION_BOOKING_LIMITS = Object.freeze({
  trial: 2,
  basic: 7,
  premium: 14,
  // abandoning this feature for now, so every user will have 9 bookings max
  unlimited: 9,
});
