import { useTranslation } from 'react-i18next';
import type { OrderItemWithCommission } from '../Orders/types/subOrder';

interface Props {
  items: OrderItemWithCommission[];
}

export const SubOrderItems = ({ items }: Props) => {
  const { t } = useTranslation();

  const headers = [
    t('ordersPage.items.productName', { defaultValue: 'Product Name' }),
    t('ordersPage.items.variant', { defaultValue: 'Variant' }),
    t('ordersPage.items.qty', { defaultValue: 'Qty' }),
    t('ordersPage.items.unitPrice', { defaultValue: 'Unit Price' }),
    t('ordersPage.items.totalPrice', { defaultValue: 'Total Price' }),
  ];

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5">
      <h6 className="font-semibold text-gray-900 mb-4">
        {t('ordersPage.orderItems')}
      </h6>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50">
              {headers.map((h) => (
                <th
                  key={h}
                  className="text-left rtl:text-right py-3 px-3 text-xs text-gray-600 font-semibold first:rounded-tl-lg last:rounded-tr-lg rtl:first:rounded-tr-lg rtl:first:rounded-tl-none rtl:last:rounded-tl-lg rtl:last:rounded-tr-none"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {items.map((item, i) => (
              <tr
                key={item.id}
                className={`${i < items.length - 1 ? 'border-b border-gray-50' : ''}`}
              >
                <td className="px-3 py-3.5 font-semibold text-gray-900">
                  {item.productName}
                </td>
                <td className="px-3 py-3.5 text-gray-500">
                  {item.variantLabel ?? '—'}
                </td>
                <td className="px-3 py-3.5 text-gray-700">{item.quantity}</td>
                <td className="px-3 py-3.5 text-gray-700">
                  {t('dashboardMetrics.unit.sar', { defaultValue: 'SAR' })}{' '}
                  {item.unitPrice.toLocaleString()}.00
                </td>
                <td className="px-3 py-3.5 font-semibold text-gray-900">
                  {t('dashboardMetrics.unit.sar', { defaultValue: 'SAR' })}{' '}
                  {item.lineTotal.toLocaleString()}.00
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
