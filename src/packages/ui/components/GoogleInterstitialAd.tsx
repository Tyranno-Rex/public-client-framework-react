/**
 * GoogleInterstitialAd - Google AdSense 전면 광고 컴포넌트
 */

import { useEffect, useState, type ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { cn } from '../../utils/cn';
import { GoogleAdSense } from './GoogleAdSense';

export interface GoogleInterstitialAdProps {
  isOpen: boolean;
  onClose: () => void;
  /** AdSense Publisher ID */
  client?: string;
  /** AdSense Slot ID */
  slot?: string;
  /** X 버튼 표시 여부 (기본: true) */
  showCloseButton?: boolean;
  /** X 버튼 표시 지연 시간 (초, 기본: 0 - 즉시 표시) */
  closeButtonDelay?: number;
  /** 광고 노출 이벤트 */
  onAdImpression?: () => void;
  /** 닫힘 버튼 클래스명 커스터마이징 */
  closeButtonClassName?: string;
}

export function GoogleInterstitialAd({
  isOpen,
  onClose,
  client,
  slot,
  showCloseButton = true,
  closeButtonDelay = 0,
  onAdImpression,
  closeButtonClassName,
}: GoogleInterstitialAdProps) {
  const [showClose, setShowClose] = useState(false);

  // Lock body scroll when ad is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
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

            {/* Google AdSense Ad */}
            <div className="w-full h-full max-w-2xl max-h-[80vh] p-4">
              <GoogleAdSense
                client={client}
                slot={slot}
                format="auto"
                responsive={true}
                style={{
                  display: 'block',
                  width: '100%',
                  minHeight: '250px',
                }}
              />
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

export default GoogleInterstitialAd;
