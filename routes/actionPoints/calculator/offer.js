/***
 * Returns a result from matrix representation. For points = 50:
 * 
 * UserLevel/ActionLevel 1   2   3    4     5
 * 1                     0   -50 -100 -150  -200
 * 2                     50  0   -50  -100  -150
 * 3                     100 50  0    -50   -100
 * 4                     150 100 50   0     -50
 * 5                     200 150 100  50    0
 * 
 */

const POINTS = 50;

const calculateOfferPoints = (userLevel = 1, offerLevel = 1) => {
  return (userLevel - offerLevel) * POINTS;
};

module.exports = calculateOfferPoints;
