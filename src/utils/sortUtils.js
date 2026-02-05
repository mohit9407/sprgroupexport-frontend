/**
 * Sorts an array of objects by their createdAt date in ascending order (oldest first)
 * @param {Array} data - Array of objects to be sorted
 * @param {string} [dateField='createdAt'] - The field name that contains the date (defaults to 'createdAt')
 * @returns {Array} - New sorted array
 */
export const sortByCreatedAt = (data, dateField = 'createdAt') => {
  if (!Array.isArray(data)) {
    console.warn('sortByCreatedAt: Expected an array, got', typeof data);
    return [];
  }

  return [...data].sort((a, b) => {
    const dateA = new Date(a[dateField] || 0);
    const dateB = new Date(b[dateField] || 0);
    return dateA - dateB; // For descending order, swap dateA and dateB: dateB - dateA
  });
};

/**
 * Sorts an array of objects by their date field in descending order (newest first)
 * @param {Array} data - Array of objects to be sorted
 * @param {string} [dateField='createdAt'] - The field name that contains the date (defaults to 'createdAt')
 * @returns {Array} - New sorted array
 */
export const sortByCreatedAtDesc = (data, dateField = 'createdAt') => {
  if (!Array.isArray(data)) {
    console.warn('sortByCreatedAtDesc: Expected an array, got', typeof data);
    return [];
  }

  return [...data].sort((a, b) => {
    const dateA = new Date(a[dateField] || 0);
    const dateB = new Date(b[dateField] || 0);
    return dateB - dateA; // For descending order (newest first)
  });
};
