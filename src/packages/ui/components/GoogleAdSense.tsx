/**
 * GoogleAdSense - Google AdSense 광고 컴포넌트
 *
 * 사용법:
 * 1. Google AdSense 계정에서 Publisher ID와 Slot ID 발급
 * 2. .env 파일에 설정:
 *    VITE_ADSENSE_PUBLISHER_ID=ca-pub-xxxxxxxxxxxxx
 *    VITE_ADSENSE_SLOT_ID=xxxxxxxxxxxxx
 * 3. 컴포넌트 사용:
 *    <GoogleAdSense format="auto" />
 */

import { useEffect, useRef } from 'react';

export interface GoogleAdSenseProps {
  /** AdSense Publisher ID (ca-pub-xxxxx) */
  client?: string;
  /** Ad Slot ID */
  slot?: string;
  /** 광고 형식 */
  format?: 'auto' | 'rectangle' | 'vertical' | 'horizontal';
  /** 광고 스타일 */
  style?: React.CSSProperties;
  /** 반응형 여부 */
  responsive?: boolean;
  /** 테스트 모드 (개발 환경에서 자동 활성화) */
  test?: boolean;
  /** 광고 로드 완료 콜백 */
  onLoad?: () => void;
  /** 광고 로드 실패 콜백 */
  onError?: (error: Error) => void;
}

/**
 * Google AdSense 광고를 표시하는 컴포넌트
 */
export function GoogleAdSense({
  client = import.meta.env.VITE_ADSENSE_PUBLISHER_ID || 'ca-pub-0000000000000000',
  slot = import.meta.env.VITE_ADSENSE_SLOT_ID || '0000000000',
  format = 'auto',
  style = { display: 'block' },
  responsive = true,
  test = import.meta.env.DEV,
  onLoad,
  onError,
}: GoogleAdSenseProps) {
  const adRef = useRef<HTMLModElement>(null);
  const loadedRef = useRef(false);

  useEffect(() => {
    // AdSense 스크립트가 이미 로드되었는지 확인
    const loadAdSenseScript = () => {
      if (document.querySelector(`script[src*="adsbygoogle.js"]`)) {
        return Promise.resolve();
      }

      return new Promise<void>((resolve, reject) => {
        const script = document.createElement('script');
        script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${client}`;
        script.async = true;
        script.crossOrigin = 'anonymous';
        script.onload = () => resolve();
        script.onerror = () => reject(new Error('Failed to load AdSense script'));
        document.head.appendChild(script);
      });
    };

    const initializeAd = async () => {
      if (loadedRef.current) return;

      try {
        // 스크립트 로드
        await loadAdSenseScript();

        // 광고 푸시
        if (window.adsbygoogle && adRef.current) {
          (window.adsbygoogle = window.adsbygoogle || []).push({});
          loadedRef.current = true;
          onLoad?.();
        }
      } catch (error) {
        console.error('AdSense initialization error:', error);
        onError?.(error as Error);
      }
    };

    initializeAd();
  }, [client, slot, onLoad, onError]);

  // 테스트 모드 표시
  if (test && (client === 'ca-pub-0000000000000000' || !client.startsWith('ca-pub-'))) {
    return (
      <div
        style={{
          ...style,
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          padding: '40px 20px',
          borderRadius: '12px',
          textAlign: 'center',
          minHeight: '250px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>📢</div>
        <div style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '8px' }}>
          Google AdSense 테스트 모드
        </div>
        <div style={{ fontSize: '14px', opacity: 0.9 }}>
          실제 광고는 Publisher ID 설정 후 표시됩니다
        </div>
        <div style={{ fontSize: '12px', opacity: 0.7, marginTop: '12px' }}>
          .env 파일에 VITE_ADSENSE_PUBLISHER_ID 설정
        </div>
      </div>
    );
  }

  return (
    <ins
      ref={adRef}
      className="adsbygoogle"
      style={style}
      data-ad-client={client}
      data-ad-slot={slot}
      data-ad-format={format}
      data-full-width-responsive={responsive ? 'true' : 'false'}
    />
  );
}

// Window 타입 확장
declare global {
  interface Window {
    adsbygoogle: unknown[];
  }
}

export default GoogleAdSense;
