/***
 * Returns a result from matrix representation. For points = 50:
 * 
 * UserLevel/ActionLevel 1   2   3    4     5
 * 1                     0   -50 -100 -150  -200
 * 2                     0   0   -50  -100  -150
 * 3                     0   0   0    -50   -100
 * 4                     0   0   0     0     -50
 * 5                     0   0   0     0     0
 * 
 */

const POINTS = 50;

const calculateOfferPoints = (userLevel = 1, offerLevel = 1) => {
  const result = (userLevel - offerLevel) * POINTS;
  return result > 0 ? 0 : result;
};

module.exports = calculateOfferPoints;
