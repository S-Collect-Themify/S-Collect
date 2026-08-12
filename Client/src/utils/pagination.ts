/**
 * Generates an array of page numbers and ellipsis string markers for pagination display.
 * If totalPages <= 5, returns all page numbers [1..totalPages].
 * If totalPages > 5, returns a windowed array with ellipsis ('...').
 */
export function getPaginationRange(
  currentPage: number,
  totalPages: number
): (number | '...')[] {
  if (totalPages <= 5) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  // When totalPages > 5:
  if (currentPage <= 3) {
    return [1, 2, 3, 4, '...', totalPages];
  }

  if (currentPage >= totalPages - 2) {
    return [
      1,
      '...',
      totalPages - 3,
      totalPages - 2,
      totalPages - 1,
      totalPages,
    ];
  }

  return [
    1,
    '...',
    currentPage - 1,
    currentPage,
    currentPage + 1,
    '...',
    totalPages,
  ];
}
