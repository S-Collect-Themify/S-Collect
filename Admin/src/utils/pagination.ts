export const DOTS = '...';

export interface PaginationRangeProps {
  currentPage: number;
  totalPages: number;
  siblingCount?: number;
}

/**
 * Computes the array of page numbers and ellipsis tokens to display.
 * When totalPages <= 7, all pages [1, 2, ..., totalPages] are returned.
 * When totalPages > 7, it returns a window with ellipsis around the active page.
 *
 * Example (totalPages = 25, siblingCount = 1):
 * - currentPage = 1 -> [1, 2, 3, 4, 5, '...', 25]
 * - currentPage = 4 -> [1, 2, 3, 4, 5, '...', 25]
 * - currentPage = 10 -> [1, '...', 9, 10, 11, '...', 25]
 * - currentPage = 25 -> [1, '...', 21, 22, 23, 24, 25]
 */
export function getPaginationRange({
  currentPage,
  totalPages,
  siblingCount = 1,
}: PaginationRangeProps): (number | typeof DOTS)[] {
  // Safe bounds
  const total = Math.max(1, totalPages || 1);
  const current = Math.min(Math.max(1, currentPage || 1), total);

  // Total numbers to display without ellipsis: 1 (first) + 1 (last) + 1 (current) + 2 * siblingCount + 2 * DOTS = 7
  const totalPageNumbers = siblingCount * 2 + 5;

  // Case 1: If total pages is less than the page numbers we want to show
  if (total <= totalPageNumbers) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }

  const leftSiblingIndex = Math.max(current - siblingCount, 1);
  const rightSiblingIndex = Math.min(current + siblingCount, total);

  // Determine whether to show left/right ellipsis
  const shouldShowLeftDots = leftSiblingIndex > 2;
  const shouldShowRightDots = rightSiblingIndex < total - 2;

  const firstPageIndex = 1;
  const lastPageIndex = total;

  // Case 2: No left dots, but right dots
  if (!shouldShowLeftDots && shouldShowRightDots) {
    const leftItemCount = 3 + 2 * siblingCount;
    const leftRange = Array.from({ length: leftItemCount }, (_, i) => i + 1);
    return [...leftRange, DOTS, lastPageIndex];
  }

  // Case 3: Left dots, but no right dots
  if (shouldShowLeftDots && !shouldShowRightDots) {
    const rightItemCount = 3 + 2 * siblingCount;
    const rightRange = Array.from(
      { length: rightItemCount },
      (_, i) => total - rightItemCount + 1 + i
    );
    return [firstPageIndex, DOTS, ...rightRange];
  }

  // Case 4: Both left and right dots
  if (shouldShowLeftDots && shouldShowRightDots) {
    const middleRange = Array.from(
      { length: rightSiblingIndex - leftSiblingIndex + 1 },
      (_, i) => leftSiblingIndex + i
    );
    return [firstPageIndex, DOTS, ...middleRange, DOTS, lastPageIndex];
  }

  return Array.from({ length: total }, (_, i) => i + 1);
}
