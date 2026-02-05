export const formatRating = (rating) => {
  if (!rating) return null;
  return Number(rating).toFixed(1);
};

export const getRatingTextColor = (rating) => {
  if (!rating) return 'text-gray-700';
  const numRating = parseFloat(rating);
  return numRating >= 4.0 ? 'text-yellow-600' : 'text-gray-700';
};

export const getRatingContainerColor = (rating) => {
  if (!rating) return 'text-gray-700';
  const numRating = parseFloat(rating);
  return numRating >= 4.0 ? 'text-yellow-600' : 'text-gray-700';
};