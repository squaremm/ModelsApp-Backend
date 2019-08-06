/***
 * Returns a result from matrix representation. For points = 50:
 * 
 * UserLevel/ActionLevel 1   2   3    4    5
 * 1                     195 160 140  125  115
 * 2                     230 195 175  160  150
 * 3                     250 215 195  180  170
 * 4                     265 230 210  195  185
 * 5                     275 240 220  205  195
 * 
 */
const calculateActionPoints = (points, userLevel = 1, offerLevel = 1) => {
  const result = Math.round((Math.log((userLevel / offerLevel) * points)) * points);
  return result % 5 < 3 ? Math.floor(result/5)*5 : Math.ceil(result/5)*5;
};

module.exports = calculateActionPoints;
