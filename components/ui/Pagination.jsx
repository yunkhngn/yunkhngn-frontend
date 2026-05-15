import { Button } from '@/components/ui/Button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export function Pagination({ currentPage, totalPages, onPageChange }) {
    if (totalPages <= 1) return null;

    const handlePageChange = (newPage) => {
        onPageChange(newPage);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    return (
        <div className="flex items-center justify-center gap-2 mt-8">
            <Button
                variant="outline"
                size="icon"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                aria-label="Previous page"
            >
                <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm font-medium">
                Page {currentPage} of {totalPages}
            </span>
            <Button
                variant="outline"
                size="icon"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                aria-label="Next page"
            >
                <ChevronRight className="h-4 w-4" />
            </Button>
        </div>
    );
}
