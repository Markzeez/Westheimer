'use client';

import { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Expand, X } from 'lucide-react';

interface ProductImageCarouselProps {
  images: Array<{ url: string; alt: string; isPrimary?: boolean }>;
  className?: string;
  autoPlay?: boolean;
  autoPlayInterval?: number;
  showThumbnails?: boolean;
}

export function ProductImageCarousel({
  images,
  className = '',
  autoPlay = false,
  autoPlayInterval = 5000,
  showThumbnails = true
}: ProductImageCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [touchStart, setTouchStart] = useState<number | null>(null);

  const primaryIndex = images.findIndex(img => img.isPrimary);
  const initialIndex = primaryIndex !== -1 ? primaryIndex : 0;

  // Auto-play functionality
  useEffect(() => {
    if (!autoPlay || images.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentIndex(prev => (prev + 1) % images.length);
    }, autoPlayInterval);

    return () => clearInterval(interval);
  }, [autoPlay, autoPlayInterval, images.length]);

  // Reset to initial index when images change
  useEffect(() => {
    setCurrentIndex(initialIndex);
  }, [initialIndex]);

  const goToPrevious = useCallback(() => {
    setCurrentIndex(prev => (prev - 1 + images.length) % images.length);
  }, [images.length]);

  const goToNext = useCallback(() => {
    setCurrentIndex(prev => (prev + 1) % images.length);
  }, [images.length]);

  const goToSlide = useCallback((index: number) => {
    setCurrentIndex(index);
  }, []);

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.touches[0].clientX);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStart === null) return;
    const touchEnd = e.changedTouches[0].clientX;
    const diff = touchStart - touchEnd;
    
    if (Math.abs(diff) > 50) {
      if (diff > 0) {
        goToNext();
      } else {
        goToPrevious();
      }
    }
    setTouchStart(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowLeft') goToPrevious();
    if (e.key === 'ArrowRight') goToNext();
    if (e.key === 'Escape') setIsFullscreen(false);
  };

  if (images.length === 0) {
    return (
      <div className={`aspect-square bg-gray-100 rounded-lg flex items-center justify-center ${className}`}>
        <span className="text-gray-400">No images available</span>
      </div>
    );
  }

  const currentImage = images[currentIndex];

  return (
    <div 
      className={`relative ${className}`}
      onKeyDown={handleKeyDown}
      tabIndex={0}
    >
      {/* Main Image Area */}
      <div className="relative aspect-square overflow-hidden rounded-lg bg-gray-50">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className="absolute inset-0"
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
          >
            <img
              src={currentImage.url}
              alt={currentImage.alt}
              className="w-full h-full object-cover"
              loading={currentIndex === 0 ? 'eager' : 'lazy'}
            />
            
            {/* Fullscreen Button */}
            <button
              onClick={() => setIsFullscreen(true)}
              className="absolute top-3 right-3 p-2 bg-black/50 text-white rounded-full hover:bg-black/70 transition-colors"
              aria-label="View fullscreen"
            >
              <Expand className="w-5 h-5" />
            </button>
          </motion.div>
        </AnimatePresence>

        {/* Navigation Arrows */}
        {images.length > 1 && (
          <>
            <button
              onClick={goToPrevious}
              className="absolute left-3 top-1/2 -translate-y-1/2 p-2 bg-white/90 text-gray-700 rounded-full hover:bg-white shadow-md transition-all duration-200 opacity-0 group-hover:opacity-100"
              aria-label="Previous image"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={goToNext}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-2 bg-white/90 text-gray-700 rounded-full hover:bg-white shadow-md transition-all duration-200 opacity-0 group-hover:opacity-100"
              aria-label="Next image"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </>
        )}

        {/* Slide Indicators */}
        {images.length > 1 && (
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
            {images.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`w-2 h-2 rounded-full transition-all duration-200 ${
                  index === currentIndex
                    ? 'bg-white w-6'
                    : 'bg-white/50 hover:bg-white/75'
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Thumbnails */}
      {showThumbnails && images.length > 1 && (
        <div className="mt-4 flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {images.map((image, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`relative flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all duration-200 ${
                index === currentIndex
                  ? 'border-primary-500'
                  : 'border-transparent hover:border-gray-300'
              }`}
              aria-label={`View image ${index + 1}`}
              aria-current={index === currentIndex ? 'true' : 'false'}
            >
              <img
                src={image.url}
                alt={image.alt}
                className="w-full h-full object-cover"
                loading="lazy"
              />
              {image.isPrimary && (
                <span className="absolute bottom-1 left-1 text-xs bg-primary-500 text-white px-1 rounded">
                  Main
                </span>
              )}
            </button>
          ))}
        </div>
      )}

      {/* Fullscreen Modal */}
      <AnimatePresence>
        {isFullscreen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black flex items-center justify-center"
            onClick={() => setIsFullscreen(false)}
            role="dialog"
            aria-modal="true"
            aria-label="Fullscreen image viewer"
          >
            <button
              onClick={(e) => { e.stopPropagation(); setIsFullscreen(false); }}
              className="absolute top-4 right-4 p-2 bg-white/10 text-white rounded-full hover:bg-white/20 transition-colors z-10"
              aria-label="Close fullscreen"
            >
              <X className="w-6 h-6" />
            </button>
            
            <button
              onClick={(e) => { e.stopPropagation(); goToPrevious(); }}
              className="absolute left-4 top-1/2 -translate-y-1/2 p-3 bg-white/10 text-white rounded-full hover:bg-white/20 transition-colors z-10"
              aria-label="Previous image"
            >
              <ChevronLeft className="w-8 h-8" />
            </button>
            
            <motion.div
              key={currentIndex}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 1.1, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="max-w-[90vw] max-h-[90vh]"
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={currentImage.url}
                alt={currentImage.alt}
                className="max-w-[90vw] max-h-[90vh] object-contain"
              />
            </motion.div>
            
            <button
              onClick={(e) => { e.stopPropagation(); goToNext(); }}
              className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-white/10 text-white rounded-full hover:bg-white/20 transition-colors z-10"
              aria-label="Next image"
            >
              <ChevronRight className="w-8 h-8" />
            </button>

            {/* Thumbnails in fullscreen */}
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2">
              {images.map((image, index) => (
                <button
                  key={index}
                  onClick={(e) => { e.stopPropagation(); goToSlide(index); }}
                  className={`w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${
                    index === currentIndex
                      ? 'border-white'
                      : 'border-white/30 hover:border-white/50'
                  }`}
                  aria-label={`View image ${index + 1}`}
                >
                  <img
                    src={image.url}
                    alt={image.alt}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default ProductImageCarousel;