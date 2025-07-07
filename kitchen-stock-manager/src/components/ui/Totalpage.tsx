// PaginationComponent.tsx
import React from "react";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/share/ui/pagination";

interface PaginationComponentProps {
  totalPages: number;
  currentPage: number;
  setCurrentPage: (page: number) => void;
}

const PaginationComponent: React.FC<PaginationComponentProps> = ({
  totalPages,
  currentPage,
  setCurrentPage,
}) => {
  // Don't render pagination if there's only one page or none
  if (totalPages <= 1) return null;

  return (
    <div className="mt-6 flex justify-center">
      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              aria-disabled={currentPage === 1}
              className={currentPage === 1 ? "opacity-50 cursor-not-allowed" : ""}
            />
          </PaginationItem>
          {[...Array(totalPages)].map((_, i) => (
            <PaginationItem key={i}>
              <PaginationLink
                isActive={currentPage === i + 1}
                onClick={() => setCurrentPage(i + 1)}
              >
                {i + 1}
              </PaginationLink>
            </PaginationItem>
          ))}
          <PaginationItem>
            <PaginationNext
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              aria-disabled={currentPage === totalPages}
              className={currentPage === totalPages ? "opacity-50 cursor-not-allowed" : ""}
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  );
};

export default PaginationComponent;