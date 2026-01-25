/**
 * AdManagementPage - 광고 관리 페이지 (관리자 전용)
 */

import { useState, useEffect } from 'react';
import { adApi, type AdConfig, type AdStatistics } from '../../packages/api/services/ad';
import { Button } from '../../packages/ui/components/Button';
import { Modal } from '../../packages/ui/components/Modal';
import { Input } from '../../packages/ui/components/Input';
import { AppCard } from '../../packages/ui/components/AppCard';
import { Badge } from '../../packages/ui/components/Badge';

export function AdManagementPage() {
  const [ads, setAds] = useState<AdConfig[]>([]);
  const [loading, setLoading] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedAd, setSelectedAd] = useState<AdConfig | null>(null);
  const [statistics, setStatistics] = useState<AdStatistics[]>([]);

  // 폼 상태
  const [formData, setFormData] = useState({
    type: 'INTERSTITIAL' as const,
    imageUrl: '',
    clickUrl: '',
    title: '',
    description: '',
    priority: 0,
  });

  // 광고 목록 조회
  const fetchAds = async () => {
    setLoading(true);
    try {
      const data = await adApi.getActiveAds();
      setAds(data);
    } catch (error) {
      console.error('Failed to fetch ads:', error);
    } finally {
      setLoading(false);
    }
  };

  // 광고 생성
  const handleCreateAd = async () => {
    try {
      await adApi.createAdConfig(formData);
      setShowCreateModal(false);
      fetchAds();
      resetForm();
      alert('광고가 생성되었습니다.');
    } catch (error) {
      console.error('Failed to create ad:', error);
      alert('광고 생성에 실패했습니다.');
    }
  };

  // 광고 삭제
  const handleDeleteAd = async (id: string) => {
    if (!confirm('정말로 이 광고를 삭제하시겠습니까?')) return;

    try {
      await adApi.deleteAdConfig(id);
      fetchAds();
      alert('광고가 삭제되었습니다.');
    } catch (error) {
      console.error('Failed to delete ad:', error);
      alert('광고 삭제에 실패했습니다.');
    }
  };

  // 광고 통계 조회
  const handleViewStatistics = async (ad: AdConfig) => {
    setSelectedAd(ad);
    try {
      const stats = await adApi.getRecentStatistics(ad.id);
      setStatistics(stats);
    } catch (error) {
      console.error('Failed to fetch statistics:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      type: 'INTERSTITIAL',
      imageUrl: '',
      clickUrl: '',
      title: '',
      description: '',
      priority: 0,
    });
  };

  useEffect(() => {
    fetchAds();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-bg p-6">
      <div className="max-w-6xl mx-auto">
        {/* 헤더 */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            광고 관리
          </h1>
          <Button onClick={() => setShowCreateModal(true)}>
            새 광고 추가
          </Button>
        </div>

        {/* 광고 목록 */}
        {loading ? (
          <div className="text-center py-12">
            <div className="text-gray-500">로딩 중...</div>
          </div>
        ) : ads.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-500">등록된 광고가 없습니다.</div>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {ads.map((ad) => (
              <AppCard key={ad.id} className="p-4">
                <div className="space-y-3">
                  {/* 광고 이미지 */}
                  {ad.imageUrl && (
                    <img
                      src={ad.imageUrl}
                      alt={ad.title || '광고'}
                      className="w-full h-40 object-cover rounded-lg"
                    />
                  )}

                  {/* 광고 정보 */}
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="primary">{ad.type}</Badge>
                      {ad.isActive && <Badge variant="success">활성</Badge>}
                    </div>
                    {ad.title && (
                      <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                        {ad.title}
                      </h3>
                    )}
                    {ad.description && (
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {ad.description}
                      </p>
                    )}
                    <p className="text-xs text-gray-500 mt-2">
                      우선순위: {ad.priority}
                    </p>
                  </div>

                  {/* 액션 버튼 */}
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleViewStatistics(ad)}
                      className="flex-1"
                    >
                      통계 보기
                    </Button>
                    <Button
                      size="sm"
                      variant="danger"
                      onClick={() => handleDeleteAd(ad.id)}
                    >
                      삭제
                    </Button>
                  </div>
                </div>
              </AppCard>
            ))}
          </div>
        )}

        {/* 광고 생성 모달 */}
        <Modal
          isOpen={showCreateModal}
          onClose={() => {
            setShowCreateModal(false);
            resetForm();
          }}
          title="새 광고 추가"
        >
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">광고 타입</label>
              <select
                value={formData.type}
                onChange={(e) =>
                  setFormData({ ...formData, type: e.target.value as 'INTERSTITIAL' })
                }
                className="w-full px-3 py-2 border rounded-lg dark:bg-dark-card dark:border-white/10"
              >
                <option value="INTERSTITIAL">전면 광고</option>
                <option value="BANNER">배너 광고</option>
                <option value="NATIVE">네이티브 광고</option>
              </select>
            </div>

            <Input
              label="광고 이미지 URL *"
              value={formData.imageUrl}
              onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
              placeholder="https://example.com/ad-image.jpg"
              required
            />

            <Input
              label="클릭 URL"
              value={formData.clickUrl}
              onChange={(e) => setFormData({ ...formData, clickUrl: e.target.value })}
              placeholder="https://example.com"
            />

            <Input
              label="제목"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="광고 제목"
            />

            <Input
              label="설명"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="광고 설명"
            />

            <Input
              label="우선순위"
              type="number"
              value={formData.priority}
              onChange={(e) => setFormData({ ...formData, priority: parseInt(e.target.value) })}
              placeholder="0"
            />

            <div className="flex gap-2 pt-4">
              <Button
                variant="outline"
                onClick={() => {
                  setShowCreateModal(false);
                  resetForm();
                }}
                className="flex-1"
              >
                취소
              </Button>
              <Button
                onClick={handleCreateAd}
                disabled={!formData.imageUrl}
                className="flex-1"
              >
                추가
              </Button>
            </div>
          </div>
        </Modal>

        {/* 통계 모달 */}
        <Modal
          isOpen={!!selectedAd}
          onClose={() => {
            setSelectedAd(null);
            setStatistics([]);
          }}
          title={`광고 통계 - ${selectedAd?.title || '광고'}`}
          size="lg"
        >
          <div className="space-y-4">
            {statistics.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                통계 데이터가 없습니다.
              </div>
            ) : (
              <div className="space-y-2">
                {statistics.map((stat) => (
                  <div
                    key={stat.id}
                    className="p-4 bg-gray-50 dark:bg-white/5 rounded-lg"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-gray-900 dark:text-white">
                        {stat.date}
                      </span>
                      <Badge variant="primary">CTR: {stat.ctr.toFixed(2)}%</Badge>
                    </div>
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <div className="text-gray-500">노출</div>
                        <div className="font-semibold text-gray-900 dark:text-white">
                          {stat.totalImpressions.toLocaleString()}
                        </div>
                      </div>
                      <div>
                        <div className="text-gray-500">클릭</div>
                        <div className="font-semibold text-gray-900 dark:text-white">
                          {stat.totalClicks.toLocaleString()}
                        </div>
                      </div>
                      <div>
                        <div className="text-gray-500">고유 사용자</div>
                        <div className="font-semibold text-gray-900 dark:text-white">
                          {stat.uniqueUsers.toLocaleString()}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </Modal>
      </div>
    </div>
  );
}

export default AdManagementPage;
