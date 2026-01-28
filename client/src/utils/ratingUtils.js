export const calculatePromptRating = (prompt) => {
  if (prompt.rating !== null && prompt.rating !== undefined) {
    return Number(prompt.rating).toFixed(1);
  }
  const likeCount = prompt.like_count || 0;
  const dislikeCount = prompt.dislike_count || 0;
  const totalVotes = likeCount + dislikeCount;
  if (totalVotes === 0) {
    return null; // Hoặc return "N/A" nếu muốn hiển thị text
  }
  const likeRatio = likeCount / totalVotes;
  const z = 1.96; // 95% confidence
  const n = totalVotes;
  const p = likeRatio;
  if (n === 0) return null;
  const denominator = 1 + (z * z) / n;
  const centre = p + (z * z) / (2 * n);
  const adjustment = z * Math.sqrt((p * (1 - p) + (z * z) / (4 * n)) / n);
  const lowerBound = (centre - adjustment) / denominator;
  const rating = 1 + (lowerBound * 4);
  return Math.max(1, Math.min(5, rating)).toFixed(1);
};
export const calculateSimpleRating = (prompt) => {
  if (prompt.rating !== null && prompt.rating !== undefined) {
    return Number(prompt.rating).toFixed(1);
  }
  const likeCount = prompt.like_count || 0;
  const dislikeCount = prompt.dislike_count || 0;
  const totalVotes = likeCount + dislikeCount;
  if (totalVotes === 0) {
    return null;
  }
  const likeRatio = likeCount / totalVotes;
  const rating = 1 + (likeRatio * 4); // Chuyển từ [0,1] sang [1,5]
  return rating.toFixed(1);
};
export const formatRating = (rating) => {
  return rating;
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