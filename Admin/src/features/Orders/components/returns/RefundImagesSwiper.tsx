import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import type { Variants } from 'framer-motion';
import {
  ChevronLeft,
  ChevronRight,
  Maximize2,
  X,
  Image as ImageIcon,
  MessageSquareQuote,
} from 'lucide-react';

interface RefundImagesSwiperProps {
  imageUrls?: string[];
  reason?: string;
  customerName?: string;
}

export const RefundImagesSwiper: React.FC<RefundImagesSwiperProps> = ({
  imageUrls = [],
  reason,
  customerName,
}) => {
  const { t, i18n } = useTranslation();
  const isRtl = i18n.language === 'ar';

  const validImages = Array.isArray(imageUrls)
    ? imageUrls.filter((img): img is string => typeof img === 'string' && img.trim().length > 0)
    : [];

  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState<number>(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  const total = validImages.length;
  const safeIndex = total > 0 ? (currentIndex % total + total) % total : 0;

  const handleNext = useCallback(() => {
    if (total <= 1) return;
    setDirection(1);
    setCurrentIndex((prev) => (prev + 1) % total);
  }, [total]);

  const handlePrev = useCallback(() => {
    if (total <= 1) return;
    setDirection(-1);
    setCurrentIndex((prev) => (prev - 1 + total) % total);
  }, [total]);

  useEffect(() => {
    if (!lightboxOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setLightboxOpen(false);
      if (e.key === 'ArrowRight') isRtl ? handlePrev() : handleNext();
      if (e.key === 'ArrowLeft') isRtl ? handleNext() : handlePrev();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [lightboxOpen, handleNext, handlePrev, isRtl]);

  const PrevIcon = isRtl ? ChevronRight : ChevronLeft;
  const NextIcon = isRtl ? ChevronLeft : ChevronRight;

  const slideVariants: Variants = {
    enter: (dir: number) => ({
      x: dir > 0 ? 60 : -60,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
      transition: { duration: 0.22, ease: 'easeOut' },
    },
    exit: (dir: number) => ({
      x: dir > 0 ? -60 : 60,
      opacity: 0,
      transition: { duration: 0.18, ease: 'easeIn' },
    }),
  };

  // If no photos are attached, render an elegant Reason & Statement Card directly
  if (total === 0) {
    if (!reason || reason === '--') return null;

    return (
      <div className="bg-white rounded-2xl border border-gray-200/80 p-4 sm:p-5 shadow-2xs space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600">
              <MessageSquareQuote size={15} />
            </div>
            <h2 className="font-bold text-gray-900 text-xs sm:text-sm">
              {t('refundDetails.reasonForRefund', 'Reason for Refund')}
            </h2>
          </div>

          {customerName && customerName !== '--' && (
            <span className="text-[11px] text-gray-400 font-medium">
              {t('refundDetails.customerLabel', 'Customer')}:{' '}
              <strong className="text-gray-700 font-semibold">{customerName}</strong>
            </span>
          )}
        </div>

        <div className="bg-amber-50/40 border border-amber-100/80 rounded-xl p-3.5">
          <p className="text-xs text-gray-800 leading-relaxed font-medium pl-3.5 rtl:pl-0 rtl:pr-3.5 border-l-2 rtl:border-l-0 rtl:border-r-2 border-amber-400 italic">
            "{reason}"
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-200/80 p-4 shadow-2xs space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-gray-100/90 flex items-center justify-center text-gray-700">
            <ImageIcon size={14} />
          </div>
          <h2 className="font-bold text-gray-900 text-xs sm:text-sm">
            {t('refundDetails.refundImages', 'Refund Evidence Photos')}
          </h2>
        </div>

        <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-gray-100 text-gray-700">
          {safeIndex + 1} / {total}
        </span>
      </div>

      {/* Compact Swiper Container */}
      <div className="space-y-2.5">
        {/* Main Swiper Canvas */}
        <div className="relative w-full h-44 sm:h-52 md:h-56 rounded-xl bg-gray-900/5 border border-gray-200/70 overflow-hidden flex items-center justify-center group select-none">
          <AnimatePresence custom={direction} initial={false} mode="wait">
            <motion.div
              key={safeIndex}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.3}
              onDragEnd={(_e, { offset }) => {
                const swipe = offset.x;
                if (swipe < -30) {
                  isRtl ? handlePrev() : handleNext();
                } else if (swipe > 30) {
                  isRtl ? handleNext() : handlePrev();
                }
              }}
              className="absolute inset-0 flex items-center justify-center cursor-grab active:cursor-grabbing p-2"
            >
              <img
                src={validImages[safeIndex]}
                alt={`Refund evidence ${safeIndex + 1}`}
                className="max-h-full max-w-full object-contain rounded-md"
              />
            </motion.div>
          </AnimatePresence>

          {/* Navigation Arrows */}
          {total > 1 && (
            <>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handlePrev();
                }}
                aria-label="Previous photo"
                className={`absolute top-1/2 -translate-y-1/2 ${
                  isRtl ? 'right-2' : 'left-2'
                } w-7 h-7 rounded-full bg-white/90 hover:bg-white text-gray-800 shadow-sm backdrop-blur-xs flex items-center justify-center transition-all opacity-85 hover:opacity-100 hover:scale-105 active:scale-95 cursor-pointer z-10`}
              >
                <PrevIcon size={14} />
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleNext();
                }}
                aria-label="Next photo"
                className={`absolute top-1/2 -translate-y-1/2 ${
                  isRtl ? 'left-2' : 'right-2'
                } w-7 h-7 rounded-full bg-white/90 hover:bg-white text-gray-800 shadow-sm backdrop-blur-xs flex items-center justify-center transition-all opacity-85 hover:opacity-100 hover:scale-105 active:scale-95 cursor-pointer z-10`}
              >
                <NextIcon size={14} />
              </button>
            </>
          )}

          {/* Zoom / Fullscreen Button */}
          <button
            type="button"
            onClick={() => setLightboxOpen(true)}
            className="absolute top-2 inset-e-2 px-2 py-1 rounded-md bg-black/60 hover:bg-black/80 text-white text-[10px] font-medium backdrop-blur-xs flex items-center gap-1 transition-all opacity-0 group-hover:opacity-100 cursor-pointer z-10 shadow-xs"
          >
            <Maximize2 size={11} />
            <span>{t('refundDetails.zoomImage', 'View full')}</span>
          </button>

          {/* Bottom Dots Navigation */}
          {total > 1 && (
            <div className="absolute bottom-2 inset-x-0 flex items-center justify-center gap-1 z-10 pointer-events-auto">
              <div className="px-2 py-0.5 rounded-full bg-black/35 backdrop-blur-xs flex items-center gap-1">
                {validImages.map((_, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setDirection(idx > safeIndex ? 1 : -1);
                      setCurrentIndex(idx);
                    }}
                    className={`h-1 rounded-full transition-all cursor-pointer ${
                      idx === safeIndex ? 'w-3.5 bg-white' : 'w-1 bg-white/50 hover:bg-white/80'
                    }`}
                    aria-label={`Go to slide ${idx + 1}`}
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Reason / Description Card Attached Below */}
        {reason && reason !== '--' && (
          <div className="bg-amber-50/50 border border-amber-200/50 rounded-lg p-2.5 space-y-1">
            <div className="flex items-center justify-between text-[11px]">
              <div className="flex items-center gap-1 font-bold text-amber-900">
                <MessageSquareQuote size={13} className="text-amber-600 shrink-0" />
                <span>{t('refundDetails.reasonForRefund', 'Reason for Refund')}</span>
              </div>
              {customerName && customerName !== '--' && (
                <span className="text-[10px] text-gray-500 font-medium">
                  {customerName}
                </span>
              )}
            </div>
            <p className="text-xs text-gray-800 leading-snug font-medium pl-3.5 rtl:pl-0 rtl:pr-3.5 border-l-2 rtl:border-l-0 rtl:border-r-2 border-amber-400">
              "{reason}"
            </p>
          </div>
        )}

        {/* Mini Thumbnail Strip (Only when multiple images) */}
        {total > 1 && (
          <div className="flex items-center gap-1.5 overflow-x-auto py-0.5 scrollbar-thin">
            {validImages.map((img, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  setDirection(idx > safeIndex ? 1 : -1);
                  setCurrentIndex(idx);
                }}
                className={`relative w-11 h-11 rounded-md overflow-hidden border transition-all shrink-0 cursor-pointer ${
                  idx === safeIndex
                    ? 'border-gray-950 ring-1 ring-gray-950/20 scale-102'
                    : 'border-gray-200 opacity-60 hover:opacity-100'
                }`}
              >
                <img
                  src={img}
                  alt={`Thumbnail ${idx + 1}`}
                  className="w-full h-full object-cover"
                />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ── Fullscreen Lightbox Modal ────────────────── */}
      {lightboxOpen && total > 0 && (
        <div
          onClick={() => setLightboxOpen(false)}
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex flex-col items-center justify-between p-4 sm:p-6"
        >
          {/* Top Bar */}
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full flex items-center justify-between text-white max-w-4xl"
          >
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-white/15 text-xs font-semibold">
                {safeIndex + 1} / {total}
              </span>
              <span className="text-xs text-gray-300">
                {t('refundDetails.refundImages', 'Refund Evidence Photos')}
              </span>
            </div>
            <button
              type="button"
              onClick={() => setLightboxOpen(false)}
              className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
            >
              <X size={18} />
            </button>
          </div>

          {/* Main Large Image */}
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative flex-1 w-full max-w-4xl flex items-center justify-center my-3 overflow-hidden"
          >
            <img
              src={validImages[safeIndex]}
              alt={`Fullscreen refund photo ${safeIndex + 1}`}
              className="max-h-[70vh] max-w-full object-contain rounded-lg shadow-2xl"
            />

            {total > 1 && (
              <>
                <button
                  type="button"
                  onClick={handlePrev}
                  className={`absolute ${
                    isRtl ? 'right-2' : 'left-2'
                  } w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center backdrop-blur-md transition-transform active:scale-90 cursor-pointer`}
                >
                  <PrevIcon size={20} />
                </button>
                <button
                  type="button"
                  onClick={handleNext}
                  className={`absolute ${
                    isRtl ? 'left-2' : 'right-2'
                  } w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center backdrop-blur-md transition-transform active:scale-90 cursor-pointer`}
                >
                  <NextIcon size={20} />
                </button>
              </>
            )}
          </div>

          {/* Bottom Reason Bar */}
          {reason && reason !== '--' && (
            <div
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-xl bg-white/10 backdrop-blur-md rounded-lg p-2.5 text-center text-white border border-white/10"
            >
              <p className="text-[11px] text-amber-200 font-semibold mb-0.5">
                {t('refundDetails.reasonForRefund', 'Reason for Refund')}:
              </p>
              <p className="text-xs text-gray-200 italic font-medium">"{reason}"</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
