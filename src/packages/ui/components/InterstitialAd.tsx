/**
 * InterstitialAd - Full-screen advertisement component
 * 전면 광고 컴포넌트
 */

import { useEffect, useState, type ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { cn } from '../../utils/cn';

export interface InterstitialAdProps {
  isOpen: boolean;
  onClose: () => void;
  /** 광고 콘텐츠 (실제 광고 SDK로 대체 가능) */
  children?: ReactNode;
  /** 광고 이미지 URL (플레이스홀더) */
  adImageUrl?: string;
  /** 광고 클릭 시 이동할 URL */
  adClickUrl?: string;
  /** X 버튼 표시 여부 (기본: true) */
  showCloseButton?: boolean;
  /** X 버튼 표시 지연 시간 (초, 기본: 0 - 즉시 표시) */
  closeButtonDelay?: number;
  /** 광고 클릭 이벤트 */
  onAdClick?: () => void;
  /** 광고 노출 이벤트 */
  onAdImpression?: () => void;
  /** 닫힘 버튼 클래스명 커스터마이징 */
  closeButtonClassName?: string;
}

export function InterstitialAd({
  isOpen,
  onClose,
  children,
  adImageUrl,
  adClickUrl,
  showCloseButton = true,
  closeButtonDelay = 0,
  onAdClick,
  onAdImpression,
  closeButtonClassName,
}: InterstitialAdProps) {
  // Lock body scroll when ad is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      // 광고 노출 이벤트 발생
      onAdImpression?.();
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen, onAdImpression]);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen && showCloseButton) {
      window.addEventListener('keydown', handleEscape);
    }
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose, showCloseButton]);

  // Close button delay logic
  const [showClose, setShowClose] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setShowClose(false);
      return;
    }

    if (closeButtonDelay === 0) {
      setShowClose(true);
      return;
    }

    const timer = setTimeout(() => {
      setShowClose(true);
    }, closeButtonDelay * 1000);

    return () => clearTimeout(timer);
  }, [isOpen, closeButtonDelay]);

  const handleAdClick = () => {
    onAdClick?.();
    if (adClickUrl) {
      window.open(adClickUrl, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 bg-black"
          />

          {/* Ad Content */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="relative w-full h-full flex items-center justify-center"
            role="dialog"
            aria-modal="true"
            aria-label="Advertisement"
          >
            {/* Close Button */}
            {showCloseButton && showClose && (
              <button
                onClick={onClose}
                className={cn(
                  'absolute top-4 right-4 z-10 p-2 rounded-full bg-black/50 hover:bg-black/70 transition-colors',
                  closeButtonClassName
                )}
                aria-label="Close advertisement"
              >
                <X className="w-6 h-6 text-white" />
              </button>
            )}

            {/* Ad Content */}
            <div className="w-full h-full flex items-center justify-center p-4">
              {children ? (
                children
              ) : adImageUrl ? (
                <div
                  onClick={handleAdClick}
                  className="cursor-pointer max-w-full max-h-full"
                >
                  <img
                    src={adImageUrl}
                    alt="Advertisement"
                    className="max-w-full max-h-full object-contain"
                  />
                </div>
              ) : (
                /* Placeholder for ad SDK */
                <div className="w-full max-w-md aspect-[9/16] bg-gray-800 rounded-2xl flex flex-col items-center justify-center text-white p-8">
                  <div className="text-6xl mb-4">📢</div>
                  <h3 className="text-xl font-bold mb-2">광고 영역</h3>
                  <p className="text-sm text-gray-400 text-center">
                    실제 광고 SDK를 연동하여
                    <br />
                    여기에 광고가 표시됩니다
                  </p>
                  <div className="mt-6 text-xs text-gray-500">
                    Google AdMob / Facebook Audience Network
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

export default InterstitialAd;
