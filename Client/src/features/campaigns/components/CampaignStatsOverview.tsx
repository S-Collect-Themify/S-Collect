import { useTranslation } from 'react-i18next';
import { Megaphone, CheckCircle2, Users, TrendingUp } from 'lucide-react';
import type { PushCampaign } from '../types';

interface CampaignStatsOverviewProps {
  campaigns: PushCampaign[];
  totalCampaignsCount: number;
}

export const CampaignStatsOverview = ({
  campaigns,
  totalCampaignsCount,
}: CampaignStatsOverviewProps) => {
  const { t } = useTranslation();

  const totalTokens = campaigns.reduce((acc, c) => acc + (c.totalTokens || 0), 0);
  const totalSuccess = campaigns.reduce((acc, c) => acc + (c.successCount || 0), 0);
  const overallRate =
    totalTokens > 0 ? Math.round((totalSuccess / totalTokens) * 100) : 100;

  const stats = [
    {
      id: 'total-campaigns',
      label: t('campaigns.stats.totalCampaigns', 'Total Campaigns'),
      value: totalCampaignsCount,
      icon: Megaphone,
      iconColor: 'text-gray-900 bg-gray-100',
    },
    {
      id: 'total-reached',
      label: t('campaigns.stats.totalReached', 'Audience Reached'),
      value: totalTokens.toLocaleString(),
      icon: Users,
      iconColor: 'text-purple-600 bg-purple-50',
    },
    {
      id: 'total-delivered',
      label: t('campaigns.stats.totalDelivered', 'Delivered Notifications'),
      value: totalSuccess.toLocaleString(),
      icon: CheckCircle2,
      iconColor: 'text-emerald-600 bg-emerald-50',
    },
    {
      id: 'delivery-rate',
      label: t('campaigns.stats.deliveryRate', 'Avg Delivery Rate'),
      value: `${overallRate}%`,
      icon: TrendingUp,
      iconColor: 'text-amber-600 bg-amber-50',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <div
            key={stat.id}
            className="bg-white rounded-2xl p-5 border border-gray-200/80 shadow-xs flex items-center justify-between gap-4 transition-all hover:shadow-sm"
          >
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                {stat.label}
              </p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {stat.value}
              </p>
            </div>
            <div
              className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${stat.iconColor}`}
            >
              <Icon size={22} />
            </div>
          </div>
        );
      })}
    </div>
  );
};
