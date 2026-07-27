import { useTranslation } from 'react-i18next';

interface Props {
  itemsTotal: number;
  shippingRateApplied: number;
  grandTotal: number;
}

export const SubOrderSummary = ({
  itemsTotal,
  shippingRateApplied,
  grandTotal,
}: Props) => {
  const { t } = useTranslation();

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5 text-sm">
      <h6 className="font-semibold text-gray-900 mb-4">
        {t('ordersPage.orderSummary')}
      </h6>
      {[
        [t('ordersPage.subtotal'), `SAR ${itemsTotal.toLocaleString()}.00`],
        [
          t('ordersPage.shippingFee'),
          `SAR ${shippingRateApplied.toLocaleString()}.00`,
        ],
      ].map(([label, val]) => (
        <div
          key={label}
          className="flex justify-between gap-4 py-1.5 text-gray-500"
        >
          <span>{label}</span>
          <span>{val}</span>
        </div>
      ))}
      <div className="flex justify-between gap-4 pt-3 mt-1 border-t border-gray-100 font-bold text-gray-900">
        <span>{t('ordersPage.grandTotal')}</span>
        <span>
          SAR{' '}
          {grandTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}
        </span>
      </div>
    </div>
  );
};
