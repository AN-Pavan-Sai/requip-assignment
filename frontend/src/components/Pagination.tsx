import type { PaginationInfo } from '../types/user';

interface PaginationProps {
  pagination: PaginationInfo;
  onPageChange: (page: number) => void;
}

/**
 * Reusable pagination component.
 * Displays page numbers with prev/next navigation and item count info.
 * Shows up to 5 page buttons with ellipsis for large page counts.
 */
export default function Pagination({ pagination, onPageChange }: PaginationProps) {
  const { page, totalItems, totalPages, hasNextPage, hasPreviousPage, limit } = pagination;

  if (totalPages <= 1) return null;

  // Calculate visible page range (show max 5 pages at a time)
  const getPageNumbers = (): (number | string)[] => {
    const pages: (number | string)[] = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      // Always show first page
      pages.push(1);

      const start = Math.max(2, page - 1);
      const end = Math.min(totalPages - 1, page + 1);

      if (start > 2) pages.push('...');
      for (let i = start; i <= end; i++) pages.push(i);
      if (end < totalPages - 1) pages.push('...');

      // Always show last page
      pages.push(totalPages);
    }

    return pages;
  };

  const startItem = (page - 1) * limit + 1;
  const endItem = Math.min(page * limit, totalItems);

  return (
    <div className="pagination">
      <div className="pagination-info">
        Showing <strong>{startItem}–{endItem}</strong> of <strong>{totalItems}</strong> users
      </div>

      <div className="pagination-controls">
        <button
          className="pagination-btn"
          onClick={() => onPageChange(page - 1)}
          disabled={!hasPreviousPage}
          aria-label="Previous page"
          id="pagination-prev"
        >
          ‹
        </button>

        {getPageNumbers().map((pageNum, idx) =>
          typeof pageNum === 'string' ? (
            <span key={`ellipsis-${idx}`} className="pagination-btn" style={{ cursor: 'default', opacity: 0.4 }}>
              …
            </span>
          ) : (
            <button
              key={pageNum}
              className={`pagination-btn ${pageNum === page ? 'active' : ''}`}
              onClick={() => onPageChange(pageNum)}
              aria-label={`Page ${pageNum}`}
              aria-current={pageNum === page ? 'page' : undefined}
              id={`pagination-page-${pageNum}`}
            >
              {pageNum}
            </button>
          )
        )}

        <button
          className="pagination-btn"
          onClick={() => onPageChange(page + 1)}
          disabled={!hasNextPage}
          aria-label="Next page"
          id="pagination-next"
        >
          ›
        </button>
      </div>
    </div>
  );
}
