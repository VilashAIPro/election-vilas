// js/utils.js

/**
 * Calculates the score message based on the score and total.
 * @param {number} score
 * @param {number} total
 * @returns {string} Feedback message
 */
function getScoreMessage(score, total) {
  if (score < 0 || total <= 0 || score > total) return 'Invalid score';
  const percentage = score / total;
  if (percentage === 1) return 'Perfect score! You could run for office.';
  if (percentage >= 0.8) return 'Excellent! You\'re election-ready.';
  if (percentage >= 0.6) return 'Well done! You know your Indian elections.';
  if (percentage >= 0.4) return 'Good effort! A few more reads and you\'ll nail it.';
  if (percentage >= 0.2) return 'Getting there! Read the India Guide section.';
  return 'Keep studying! Review the guide above.';
}

/**
 * Validates election dates.
 * @param {string} dateString
 * @returns {boolean} true if future date, false otherwise
 */
function isFutureDate(dateString) {
  const target = new Date(dateString);
  if (isNaN(target.getTime())) return false;
  return target > new Date();
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { getScoreMessage, isFutureDate };
}
