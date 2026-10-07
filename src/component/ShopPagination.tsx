'use client';

import { useRouter } from 'next/navigation';
import { Pagination } from './Pagination';

interface ShopPaginationProps {
  currentPage: number;
  totalPages: number;
  queryString: string;
}

export function ShopPagination({
  currentPage,
  totalPages,
  queryString,
}: ShopPaginationProps) {
  const router = useRouter();

  const setCurrentPage = (page: number) => {
    const params = new URLSearchParams(queryString);
    params.set('page', String(page));
    router.push(`/shop?${params.toString()}`);
  };

  return (
    <Pagination
      currentPage={currentPage}
      totalPages={totalPages}
      setCurrentPage={setCurrentPage}
    />
  );
}