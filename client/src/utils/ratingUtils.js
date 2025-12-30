/**
 * Tính rating cho prompt dựa trên like/dislike count
 * @param {Object} prompt - Prompt object
 * @param {number} prompt.like_count - Số lượt like
 * @param {number} prompt.dislike_count - Số lượt dislike  
 * @param {number} prompt.rating - Rating có sẵn (nếu có)
 * @returns {string} Rating từ 0.0 đến 5.0
 */
export const calculatePromptRating = (prompt) => {
  // Nếu có rating có sẵn, sử dụng nó
  if (prompt.rating !== null && prompt.rating !== undefined) {
    return Number(prompt.rating).toFixed(1);
  }

  const likeCount = prompt.like_count || 0;
  const dislikeCount = prompt.dislike_count || 0;
  const totalVotes = likeCount + dislikeCount;

  // Nếu chưa có vote nào, trả về null hoặc "N/A"
  if (totalVotes === 0) {
    return null; // Hoặc return "N/A" nếu muốn hiển thị text
  }

  // Tính tỷ lệ like
  const likeRatio = likeCount / totalVotes;
  
  // Áp dụng confidence interval để tránh rating cao với ít vote
  // Wilson score interval cho confidence 95%
  const z = 1.96; // 95% confidence
  const n = totalVotes;
  const p = likeRatio;
  
  if (n === 0) return null;
  
  const denominator = 1 + (z * z) / n;
  const centre = p + (z * z) / (2 * n);
  const adjustment = z * Math.sqrt((p * (1 - p) + (z * z) / (4 * n)) / n);
  
  const lowerBound = (centre - adjustment) / denominator;
  
  // Chuyển đổi từ [0,1] sang [1,5] để có rating từ 1-5 sao
  // Nhưng vẫn cho phép rating thấp nếu có nhiều dislike
  const rating = 1 + (lowerBound * 4);
  
  return Math.max(1, Math.min(5, rating)).toFixed(1);
};

/**
 * Tính rating đơn giản hơn (không dùng Wilson score)
 * @param {Object} prompt - Prompt object
 * @returns {string|null} Rating từ 1.0 đến 5.0 hoặc null nếu chưa có vote
 */
export const calculateSimpleRating = (prompt) => {
  // Nếu có rating có sẵn, sử dụng nó
  if (prompt.rating !== null && prompt.rating !== undefined) {
    return Number(prompt.rating).toFixed(1);
  }

  const likeCount = prompt.like_count || 0;
  const dislikeCount = prompt.dislike_count || 0;
  const totalVotes = likeCount + dislikeCount;

  // Nếu chưa có vote nào, trả về null
  if (totalVotes === 0) {
    return null;
  }

  // Tính rating từ 1-5 dựa trên tỷ lệ like
  const likeRatio = likeCount / totalVotes;
  const rating = 1 + (likeRatio * 4); // Chuyển từ [0,1] sang [1,5]
  
  return rating.toFixed(1);
};

/**
 * Format rating để hiển thị - trả về null nếu chưa có rating để ẩn component
 * @param {string|null} rating - Rating value
 * @returns {string|null} Formatted rating hoặc null để ẩn
 */
export const formatRating = (rating) => {
  return rating;
};

/**
 * Lấy class màu cho rating text dựa trên giá trị rating
 * @param {string|null} rating - Rating value
 * @returns {string} CSS class cho màu text
 */
export const getRatingTextColor = (rating) => {
  if (!rating) return 'text-gray-700';
  
  const numRating = parseFloat(rating);
  return numRating >= 4.0 ? 'text-yellow-600' : 'text-gray-700';
};

/**
 * Lấy class màu cho container rating (cả sao và text) dựa trên giá trị rating
 * @param {string|null} rating - Rating value
 * @returns {string} CSS class cho màu container
 */
export const getRatingContainerColor = (rating) => {
  if (!rating) return 'text-gray-700';
  
  const numRating = parseFloat(rating);
  return numRating >= 4.0 ? 'text-yellow-600' : 'text-gray-700';
};