import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Card } from './VendorDetailsCards';
import { useVendorDetailsStore } from '../store/useVendorDetailsStore';

interface ProductItem {
  id?: string;
  name: string;
  category: string;
  price: number;
  status: string;
}

interface VendorRecentProductsTableProps {
  vendorId: string;
  vendorName?: string;
  products: ProductItem[];
}

export default function VendorRecentProductsTable({
  vendorId,
  vendorName,
  products,
}: VendorRecentProductsTableProps) {
  const { t, i18n } = useTranslation();
  const isRtl = i18n.language === 'ar';
  const navigate = useNavigate();
  const { handleNavigate } = useVendorDetailsStore();

  const productsUrl = `/products?vendorId=${encodeURIComponent(vendorId)}${
    vendorName ? `&vendorName=${encodeURIComponent(vendorName)}` : ''
  }`;

  return (
    <Card className="mb-5 overflow-hidden border border-gray-100/80 shadow-2xs">
      {/* Desktop Table View */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="bg-gray-100/70 border-b border-gray-100">
              <th className="px-6 py-3.5 text-start text-xs font-bold text-gray-900">
                {t('vendors.details.recentProducts', 'Recent Products')}
              </th>
              <th className="px-6 py-3.5 text-start text-xs font-medium text-gray-500">
                {t('vendors.details.category', 'Category')}
              </th>
              <th className="px-6 py-3.5 text-start text-xs font-medium text-gray-500">
                {t('vendors.details.price', 'Price')}
              </th>
              <th className="px-6 py-3.5 text-start text-xs font-medium text-gray-500">
                {t('vendors.details.status', 'Status')}
              </th>
            </tr>
          </thead>
          <tbody>
            {products.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-6 py-8 text-center text-xs text-gray-400">
                  {t('vendors.details.noProductsYet', 'No products yet')}
                </td>
              </tr>
            ) : (
              products.slice(0, 5).map((product, idx) => (
                <tr
                  key={`${product.name}-${idx}`}
                  className="border-b border-gray-50 hover:bg-gray-50/60 transition-colors"
                >
                  <td
                    className="px-6 py-4 text-gray-900 font-medium text-xs cursor-pointer hover:underline"
                    onClick={() => handleNavigate(product.id || '', navigate)}
                  >
                    {product.name}
                  </td>
                  <td className="px-6 py-4 text-gray-400 text-xs">{product.category}</td>
                  <td className="px-6 py-4 text-gray-900 text-xs font-bold">
                    {product.price.toLocaleString()} {isRtl ? '﷼' : 'SAR'}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        product.status === 'active'
                          ? 'bg-emerald-50 text-emerald-600'
                          : 'bg-gray-100 text-gray-500'
                      }`}
                    >
                      {product.status === 'active'
                        ? t('vendors.details.statusActive', 'Active')
                        : t('vendors.details.statusInactive', 'Inactive')}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        <div className="py-3 border-t border-gray-100 text-center">
          <Link
            to={productsUrl}
            className="inline-flex items-center justify-center gap-1.5 text-xs font-medium text-blue-600 hover:text-blue-700 transition-colors"
          >
            {t('vendors.details.viewAllProducts', 'View All Products')} →
          </Link>
        </div>
      </div>

      {/* Mobile Card List View (Sliced to 2 items) */}
      <div className="md:hidden p-4">
        <h2 className="text-sm font-bold text-gray-900 mb-3">
          {t('vendors.details.recentProducts', 'Recent Products')}
        </h2>
        {products.length === 0 ? (
          <p className="text-center text-xs text-gray-400 py-6">
            {t('vendors.details.noProductsYet', 'No products yet')}
          </p>
        ) : (
          <div className="space-y-3">
            {products.slice(0, 2).map((product, idx) => (
              <div
                key={`${product.name}-${idx}`}
                className="bg-white rounded-2xl border border-gray-100 p-4 shadow-2xs space-y-2"
              >
                <div className="flex items-center justify-between gap-2">
                  <span
                    className="text-xs font-bold text-gray-900 truncate cursor-pointer"
                    onClick={() => handleNavigate(product.id || '', navigate)}
                  >
                    {product.name}
                  </span>
                  <span className="text-xs text-gray-400">{product.category}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-gray-900">
                    {product.price.toLocaleString()} {isRtl ? '﷼' : 'SAR'}
                  </span>
                  <span
                    className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      product.status === 'active'
                        ? 'bg-emerald-50 text-emerald-600'
                        : 'bg-gray-100 text-gray-500'
                    }`}
                  >
                    {product.status === 'active'
                      ? t('vendors.details.statusActive', 'Active')
                      : t('vendors.details.statusInactive', 'Inactive')}
                  </span>
                </div>
              </div>
            ))}
            <div className="pt-2 text-center">
              <Link
                to={productsUrl}
                className="inline-flex items-center justify-center gap-1.5 text-xs font-medium text-blue-600 hover:text-blue-700 transition-colors"
              >
                {t('vendors.details.viewAllProducts', 'View All Products')} →
              </Link>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}
