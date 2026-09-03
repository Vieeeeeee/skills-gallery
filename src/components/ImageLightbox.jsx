import React, { useEffect } from 'react';
import { X, Download, ZoomIn, ChevronLeft, ChevronRight } from 'lucide-react';

export function ImageLightbox({ images = [], currentIndex = 0, isOpen, onClose, onIndexChange }) {
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft' && images.length > 1) {
        onIndexChange((currentIndex - 1 + images.length) % images.length);
      }
      if (e.key === 'ArrowRight' && images.length > 1) {
        onIndexChange((currentIndex + 1) % images.length);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, currentIndex, images, onClose, onIndexChange]);

  if (!isOpen || !images || images.length === 0) return null;

  const currentImage = images[currentIndex] || images[0];

  const handleDownload = (e) => {
    e.stopPropagation();
    const link = document.createElement('a');
    link.href = currentImage;
    link.download = currentImage.split('/').pop() || 'gallery-image.webp';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div 
      className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 transition-all duration-300 animate-fadeIn"
      onClick={onClose}
    >
      {/* Top Action Bar */}
      <div className="absolute top-4 right-4 sm:top-6 sm:right-6 flex items-center gap-2 z-10" onClick={(e) => e.stopPropagation()}>
        {images.length > 1 && (
          <div className="px-3 py-1.5 rounded-full bg-white/10 text-white/90 text-xs font-mono backdrop-blur-md mr-2">
            {currentIndex + 1} / {images.length}
          </div>
        )}

        <button
          onClick={handleDownload}
          className="p-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all backdrop-blur-md"
          title="下载原图"
        >
          <Download className="w-4 h-4 sm:w-5 sm:h-5" />
        </button>

        <button
          onClick={onClose}
          className="p-2.5 rounded-full bg-white/15 hover:bg-white/30 text-white transition-all backdrop-blur-md"
          title="关闭 (Esc)"
        >
          <X className="w-5 h-5 sm:w-6 sm:h-6" />
        </button>
      </div>

      {/* Main Image Container */}
      <div className="relative max-w-[95vw] max-h-[90vh] flex items-center justify-center" onClick={(e) => e.stopPropagation()}>
        <img
          src={currentImage}
          alt="高清预览"
          className="max-w-full max-h-[85vh] sm:max-h-[90vh] object-contain rounded-lg shadow-2xl transition-transform duration-200 select-none"
        />
      </div>

      {/* Prev / Next Controls */}
      {images.length > 1 && (
        <>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onIndexChange((currentIndex - 1 + images.length) % images.length);
            }}
            className="absolute left-3 sm:left-6 p-3 rounded-full bg-white/10 hover:bg-white/25 text-white backdrop-blur-md transition-all"
            title="上一张 (←)"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              onIndexChange((currentIndex + 1) % images.length);
            }}
            className="absolute right-3 sm:right-6 p-3 rounded-full bg-white/10 hover:bg-white/25 text-white backdrop-blur-md transition-all"
            title="下一张 (→)"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </>
      )}
    </div>
  );
}
