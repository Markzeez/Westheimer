'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  setCurrentPage: (page: number) => void;
  className?: string;
  showPageNumbers?: boolean;
  maxPageNumbers?: number;
}

export function Pagination({
  currentPage,
  totalPages,
  setCurrentPage,
  className = '',
  showPageNumbers = true,
  maxPageNumbers = 5,
}: PaginationProps) {
  if (totalPages <= 1) return null;

  const getPageNumbers = () => {
    if (totalPages <= maxPageNumbers) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    const half = Math.floor(maxPageNumbers / 2);
    let start = Math.max(1, currentPage - half);
    let end = Math.min(totalPages, start + maxPageNumbers - 1);

    if (end - start + 1 < maxPageNumbers) {
      start = Math.max(1, end - maxPageNumbers + 1);
    }

    const pages: (number | 'ellipsis')[] = [];
    
    if (start > 1) {
      pages.push(1);
      if (start > 2) pages.push('ellipsis');
    }
    
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    
    if (end < totalPages) {
      if (end < totalPages - 1) pages.push('ellipsis');
      pages.push(totalPages);
    }

    return pages;
  };

  const pageNumbers = getPageNumbers();

  return (
    <nav
      className={`flex items-center justify-center gap-1 ${className}`}
      aria-label="Pagination"
    >
      <button
        onClick={() => setCurrentPage(currentPage - 1)}
        disabled={currentPage === 1}
        className="px-3 py-2 text-gray-500 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors"
        aria-label="Previous page"
        aria-disabled={currentPage === 1}
      >
        <ChevronLeft className="w-5 h-5" />
      </button>

      {showPageNumbers && (
        <div className="flex items-center gap-1">
          {pageNumbers.map((page, index) =>
            page === 'ellipsis' ? (
              <span key={`ellipsis-${index}`} className="px-3 py-2 text-gray-400">
                ...
              </span>
            ) : (
              <button
                key={page}
                onClick={() => setCurrentPage(page as number)}
                className={`w-10 h-10 rounded-lg font-medium transition-all ${
                  currentPage === page
                    ? 'bg-primary-600 text-white shadow-lg'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                }`}
                aria-label={`Page ${page}`}
                aria-current={currentPage === page ? 'page' : undefined}
              >
                {page}
              </button>
            )
          )}
        </div>
      )}

      <button
        onClick={() => setCurrentPage(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="px-3 py-2 text-gray-500 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors"
        aria-label="Next page"
        aria-disabled={currentPage === totalPages}
      >
        <ChevronRight className="w-5 h-5" />
      </button>
    </nav>
  );
}

export default Pagination;