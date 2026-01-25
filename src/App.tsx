/**
 * App - Main application entry point
 */

import { useState, useEffect } from 'react';
import { ThemeProvider } from './packages/theme';
import { AuthProvider } from './packages/auth';
import { ToastContainer } from './packages/ui';
import { InterstitialAd } from './packages/ui/components/InterstitialAd';
import { GoogleInterstitialAd } from './packages/ui/components/GoogleInterstitialAd';
import { MainLayout } from './app/layouts/MainLayout';
import { HomePage } from './app/pages/HomePage';
import { ProfilePage } from './app/pages/ProfilePage';
import { AdManagementPage } from './app/pages/AdManagementPage';
import { config } from './app/config';
import { adApi, type AdConfig } from './packages/api/services/ad';

function App() {
  const [activeTab, setActiveTab] = useState('home');
  const [showAd, setShowAd] = useState(false);
  const [adConfig, setAdConfig] = useState<AdConfig | null>(null);
  const [showGoogleAd, setShowGoogleAd] = useState(false);
  const [adType, setAdType] = useState<'custom' | 'google'>('custom');

  // 앱 진입 시 광고 조회 및 표시
  useEffect(() => {
    const fetchAd = async () => {
      try {
        // 1. 먼저 자체 광고 확인
        const ad = await adApi.getInterstitialAd();
        if (ad) {
          setAdConfig(ad);
          setAdType('custom');
          setShowAd(true);
          return;
        }

        // 2. 자체 광고가 없으면 Google AdSense 광고 표시
        // (환경변수에 VITE_ADSENSE_PUBLISHER_ID가 설정되어 있을 때만)
        if (import.meta.env.VITE_ADSENSE_PUBLISHER_ID) {
          setAdType('google');
          setShowGoogleAd(true);
        }
      } catch (error) {
        console.error('Failed to fetch ad:', error);
        // 자체 광고 로드 실패 시 Google AdSense로 폴백
        if (import.meta.env.VITE_ADSENSE_PUBLISHER_ID) {
          setAdType('google');
          setShowGoogleAd(true);
        }
      }
    };

    fetchAd();
  }, []);

  const handleCloseAd = () => {
    setShowAd(false);
    setShowGoogleAd(false);
  };

  const handleGoogleAdImpression = () => {
    console.log('Google AdSense impression tracked');
    // TODO: 서버에 Google AdSense 노출 기록 (선택사항)
  };

  const handleAdImpression = async () => {
    if (!adConfig?.id) return;

    try {
      // 서버에 광고 노출 이벤트 기록
      await adApi.recordImpression({
        adId: adConfig.id,
        // userId: 로그인한 경우 사용자 ID 추가
        // deviceInfo: navigator.userAgent
      });
      console.log('Ad impression tracked:', adConfig.id);
    } catch (error) {
      console.error('Failed to record ad impression:', error);
    }
  };

  const handleAdClick = async () => {
    if (!adConfig?.id) return;

    try {
      // 서버에 광고 클릭 이벤트 기록
      await adApi.recordClick({
        adId: adConfig.id,
        // userId: 로그인한 경우 사용자 ID 추가
        // deviceInfo: navigator.userAgent
      });
      console.log('Ad click tracked:', adConfig.id);
    } catch (error) {
      console.error('Failed to record ad click:', error);
    }
  };

  const renderPage = () => {
    switch (activeTab) {
      case 'home':
        return <HomePage />;
      case 'profile':
        return <ProfilePage />;
      case 'admin-ads':
        return <AdManagementPage />;
      default:
        return <HomePage />;
    }
  };

  return (
    <ThemeProvider defaultMode="system">
      <AuthProvider apiBaseUrl={config.api.baseUrl}>
        <MainLayout activeTab={activeTab} onTabChange={setActiveTab}>
          {renderPage()}
        </MainLayout>
        <ToastContainer />

        {/* 자체 광고 */}
        {adType === 'custom' && (
          <InterstitialAd
            isOpen={showAd}
            onClose={handleCloseAd}
            onAdImpression={handleAdImpression}
            onAdClick={handleAdClick}
            showCloseButton={true}
            closeButtonDelay={0}
            adImageUrl={adConfig?.imageUrl}
            adClickUrl={adConfig?.clickUrl}
          />
        )}

        {/* Google AdSense 광고 */}
        {adType === 'google' && (
          <GoogleInterstitialAd
            isOpen={showGoogleAd}
            onClose={handleCloseAd}
            onAdImpression={handleGoogleAdImpression}
            showCloseButton={true}
            closeButtonDelay={0}
          />
        )}
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
