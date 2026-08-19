import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { ChevronDown, Edit2, ExternalLink, Check, X, Loader2, MessageSquare, Lock, Package } from 'lucide-react';
import toast from 'react-hot-toast';
import type { AdminSubOrder } from '../../../services/orders';

export function getItemThumbnail(it: any): string | null {
  if (!it) return null;
  const raw =
    it.thumbnailUrl ||
    it.imageUrl ||
    it.image ||
    it.thumbnail ||
    it.productImage ||
    it.productImageUrl ||
    it.mainImage ||
    it.product?.thumbnailUrl ||
    it.product?.imageUrl ||
    (Array.isArray(it.product?.images) && (it.product.images[0]?.url || it.product.images[0])) ||
    (Array.isArray(it.images) && (it.images[0]?.url || it.images[0]));

  if (typeof raw === 'string' && raw.trim()) return raw.trim();
  if (typeof raw === 'object' && raw !== null) {
    return (raw.url || raw.src || raw.link || null) as string | null;
  }
  return null;
}
import PortalDropdown from '../../../components/ui/PortalDropdown';
import { useAdminProfile } from '../../../hooks/useAdminProfile';

interface SubOrderCardProps {
  subOrder: AdminSubOrder;
  vendorName: string;
  orderId?: string;
  onUpdateStatus: (payload: { status: string; trackingNumber?: string; reason?: string }) => Promise<void> | void;
  isUpdating?: boolean;
  StatusBadge: React.ComponentType<{ status?: string }>;
  getProductThumbnail?: (name?: string) => string;
}

export const SubOrderCard = ({
  subOrder,
  vendorName,
  onUpdateStatus,
  isUpdating = false,
  StatusBadge,
}: SubOrderCardProps) => {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const isRtl = i18n.language === 'ar';
  const { isSuperAdmin } = useAdminProfile();

  const defaultTracking = typeof subOrder.trackingNumber === 'string' && subOrder.trackingNumber ? subOrder.trackingNumber : '--';
  const defaultReason = typeof subOrder.statusOverrideReason === 'string' ? subOrder.statusOverrideReason : '';

  const [trackingNumber, setTrackingNumber] = useState(defaultTracking);
  const [isEditingTracking, setIsEditingTracking] = useState(false);
  const [reasonModalOpen, setReasonModalOpen] = useState(false);
  const [pendingStatus, setPendingStatus] = useState<string | null>(null);
  const [reasonText, setReasonText] = useState(defaultReason);
  const [reasonError, setReasonError] = useState(false);

  const statusOptions = ['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'];

  const quickReasons = [
    { key: 'ordersPage.modal.suggestionsList.unresponsive', defaultText: 'Vendor unresponsive after 5 business days' },
    { key: 'ordersPage.modal.suggestionsList.outOfStock', defaultText: 'Item out of stock' },
    { key: 'ordersPage.modal.suggestionsList.shippingDelay', defaultText: 'Courier shipping delay' },
    { key: 'ordersPage.modal.suggestionsList.manualUpdate', defaultText: 'Manual admin status update' },
  ];

  const handleSaveTracking = async () => {
    if (!isSuperAdmin) {
      toast.error(t('ordersPage.superAdminOnly', 'Restricted: Only Super Admin can change order status.'));
      return;
    }
    setIsEditingTracking(false);
    await onUpdateStatus({
      status: subOrder.status,
      trackingNumber,
      reason: reasonText || undefined,
    });
  };

  const handleStatusSelect = (st: string) => {
    if (!isSuperAdmin) {
      toast.error(t('ordersPage.superAdminOnly', 'Restricted: Only Super Admin can change order status.'));
      return;
    }
    if (st === subOrder.status) return;
    setPendingStatus(st);
    setReasonError(false);
    setReasonModalOpen(true);
  };

  const handleConfirmStatusChange = async () => {
    if (!isSuperAdmin) {
      toast.error(t('ordersPage.superAdminOnly', 'Restricted: Only Super Admin can change order status.'));
      return;
    }
    if (!pendingStatus) return;
    if (!reasonText.trim()) {
      setReasonError(true);
      return;
    }
    setReasonModalOpen(false);
    setReasonError(false);
    await onUpdateStatus({
      status: pendingStatus,
      trackingNumber,
      reason: reasonText.trim(),
    });
    setPendingStatus(null);
  };

  const currentItems = subOrder.items || [];
  const subtotal = currentItems.reduce((acc, i) => acc + (i.lineTotal || 0), 0);

  const firstProductId = (currentItems[0]?.productId || currentItems[0]?.id) as string | undefined;

  const handleViewProduct = (prodId?: string) => {
    const targetId = prodId || firstProductId;
    if (targetId) {
      navigate(`/products/${targetId}`);
    }
  };

  return (
    <div className="p-4 rounded-2xl border border-gray-200/70 bg-white space-y-4 relative">
      {isUpdating && (
        <div className="absolute inset-0 bg-white/70 backdrop-blur-[1px] rounded-2xl z-20 flex items-center justify-center gap-2 text-xs font-semibold text-blue-600">
          <Loader2 className="animate-spin" size={18} />
          <span>{t('ordersPage.updatingSubOrder', 'Updating sub-order...')}</span>
        </div>
      )}

      {/* Sub-order Header */}
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-gray-900 text-sm">{vendorName}</h3>
        <div className="flex items-center gap-2">
          <StatusBadge status={subOrder.status} />
        </div>
      </div>

      {/* Status Override Reason display if available */}
      {Boolean(subOrder.statusOverrideReason) && (
        <div className="bg-amber-50/70 border border-amber-200/60 rounded-lg p-2.5 flex items-start gap-2 text-xs text-amber-800">
          <MessageSquare size={14} className="shrink-0 text-amber-600 mt-0.5" />
          <div>
            <span className="font-semibold">{t('ordersPage.reason', 'Reason')}: </span>
            <span>{String(subOrder.statusOverrideReason)}</span>
          </div>
        </div>
      )}

      {/* Controls Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
        {/* Tracking No */}
        <div>
          <label className="block text-[11px] text-gray-400 mb-1 font-medium">
            {t('ordersPage.trackingNoLabel', 'Tracking No.')}
          </label>
          <div className="relative flex items-center">
            <input
              type="text"
              value={trackingNumber}
              disabled={!isEditingTracking || !isSuperAdmin}
              onChange={(e) => setTrackingNumber(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && isEditingTracking) {
                  handleSaveTracking();
                }
              }}
              className={`w-full py-2 rounded-lg border text-xs font-mono transition-colors ${
                isEditingTracking
                  ? 'border-blue-500 bg-white text-gray-900 focus:outline-none ring-2 ring-blue-100'
                  : 'border-gray-200 text-gray-800 bg-gray-50/50'
              } ${isRtl ? 'pl-16 pr-3' : 'pr-16 pl-3'}`}
            />
            <div className={`absolute top-1/2 -translate-y-1/2 flex items-center gap-1 ${isRtl ? 'left-2' : 'right-2'}`}>
              {isEditingTracking ? (
                <>
                  <button
                    type="button"
                    onClick={handleSaveTracking}
                    title="Save tracking number"
                    className="p-1 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors cursor-pointer"
                  >
                    <Check size={14} />
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setTrackingNumber(defaultTracking);
                      setIsEditingTracking(false);
                    }}
                    title="Cancel"
                    className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
                  >
                    <X size={14} />
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    if (!isSuperAdmin) {
                      toast.error(t('ordersPage.superAdminOnly', 'Restricted: Only Super Admin can change order status.'));
                      return;
                    }
                    setIsEditingTracking(true);
                  }}
                  title={!isSuperAdmin ? t('ordersPage.superAdminOnly', 'Restricted: Only Super Admin can change order status.') : "Edit tracking number"}
                  className={`p-1 rounded-lg transition-colors ${!isSuperAdmin ? 'text-gray-300 cursor-not-allowed' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100 cursor-pointer'}`}
                >
                  <Edit2 size={13} />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Change Status */}
        <div>
          <label className="block text-[11px] text-gray-400 mb-1 font-medium flex items-center justify-between">
            <span>{t('ordersPage.changeStatus', 'Change Status')}</span>
            {!isSuperAdmin && (
              <span className="text-[10px] text-rose-500 font-semibold flex items-center gap-0.5">
                <Lock size={10} /> Super Admin Only
              </span>
            )}
          </label>
          <PortalDropdown
            minWidth={160}
            animate={false}
            menuClassName="bg-white border border-gray-200 rounded-lg shadow-md overflow-hidden z-50 py-1"
            trigger={({ isOpen, toggle }) => (
              <button
                type="button"
                onClick={() => {
                  if (!isSuperAdmin) {
                    toast.error(t('ordersPage.superAdminOnly', 'Restricted: Only Super Admin can change order status.'));
                    return;
                  }
                  toggle();
                }}
                disabled={!isSuperAdmin}
                title={!isSuperAdmin ? t('ordersPage.superAdminOnly', 'Restricted: Only Super Admin can change order status.') : undefined}
                className={`w-full flex items-center justify-between py-2 px-3 rounded-lg border text-xs transition-colors ${
                  !isSuperAdmin
                    ? 'bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed'
                    : 'border-gray-200 text-gray-800 bg-gray-50/50 hover:bg-white cursor-pointer'
                }`}
              >
                <span>{t(`ordersPage.statuses.${subOrder.status}`, subOrder.status)}</span>
                <ChevronDown
                  size={14}
                  className={`text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                />
              </button>
            )}
          >
            {({ close }) => (
              <div>
                {statusOptions.map((st) => (
                  <button
                    key={st}
                    type="button"
                    onClick={() => {
                      close();
                      handleStatusSelect(st);
                    }}
                    className={`w-full text-start px-3 py-2 text-xs font-medium hover:bg-gray-50 cursor-pointer ${
                      subOrder.status === st ? 'font-bold bg-blue-50/60 text-blue-700' : 'text-gray-700'
                    }`}
                  >
                    {t(`ordersPage.statuses.${st}`, st)}
                  </button>
                ))}
              </div>
            )}
          </PortalDropdown>
        </div>
      </div>

      <div className="flex justify-end">
        <button
          type="button"
          onClick={() => handleViewProduct()}
          disabled={!firstProductId}
          className="text-[11px] text-blue-600 font-semibold hover:underline flex items-center gap-1 cursor-pointer disabled:opacity-40 disabled:no-underline disabled:cursor-not-allowed"
        >
          <span>{t('ordersPage.viewProduct', 'View Product')}</span>
          <ExternalLink size={11} />
        </button>
      </div>

      {/* Sub-order Items List */}
      <div className="space-y-3 pt-2 border-t border-gray-100">
        {currentItems.map((it: any) => {
          const itemProdId = (it.productId || it.id) as string | undefined;
          const thumbUrl = getItemThumbnail(it);
          const prodDisplayName = isRtl && (it.productNameAr || it.productName_ar || it.product?.nameAr || it.product?.name_ar)
            ? (it.productNameAr || it.productName_ar || it.product?.nameAr || it.product?.name_ar)
            : it.productName;
          return (
            <div key={it.id} className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-3">
                <div
                  onClick={() => itemProdId && handleViewProduct(itemProdId)}
                  className="w-10 h-10 rounded-lg bg-gray-100 border border-gray-100 shrink-0 flex items-center justify-center text-base cursor-pointer hover:bg-gray-200 transition-colors overflow-hidden"
                >
                  {thumbUrl ? (
                    <img src={thumbUrl} alt={prodDisplayName} className="w-full h-full object-cover" />
                  ) : (
                    <Package className="text-gray-400" size={16} />
                  )}
                </div>
                <div>
                  <p
                    onClick={() => itemProdId && handleViewProduct(itemProdId)}
                    className="font-bold text-gray-900 cursor-pointer hover:underline hover:text-blue-600 transition-colors"
                  >
                    {prodDisplayName}
                  </p>
                  <p className="text-gray-400 text-[11px]">
                    {t('ordersPage.qtyColon', 'Qty:')} {it.quantity}
                  </p>
                </div>
              </div>
              <span className="font-bold text-gray-900 text-xs">{(it.lineTotal || 0).toFixed(2)} {isRtl ? '﷼' : 'SAR'}</span>
            </div>
          );
        })}
      </div>

      <div className="pt-2 border-t border-gray-100 text-end text-xs space-y-0.5 text-gray-500">
        <p className='flex justify-between'>
          {t('ordersPage.subtotalColon', 'Subtotal:')}{' '}
          <span className="font-semibold text-gray-900">{subtotal.toFixed(2)} {isRtl ? '﷼' : 'SAR'}</span>
        </p>
        <p className='flex justify-between'>
          {t('ordersPage.shippingColon', 'Shipping:')}{' '}
          <span className="font-semibold text-gray-900">{(subOrder.shippingRateApplied || 0).toFixed(2)} {isRtl ? '﷼' : 'SAR'}</span>
        </p>
      </div>

      {/* Reason Dialog / Modal */}
      {reasonModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-5 max-w-md w-full shadow-2xl border border-gray-100 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-gray-900 text-base">
                {t('ordersPage.modal.updateStatusTitle', 'Update Sub-Order Status')}
              </h3>
              <button
                type="button"
                onClick={() => {
                  setReasonModalOpen(false);
                  setPendingStatus(null);
                }}
                className="text-gray-400 hover:text-gray-600 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="bg-gray-50 rounded-lg p-3 flex justify-between items-center">
                <span className="text-gray-500 font-medium">
                  {t('ordersPage.modal.newStatus', 'New Status:')}
                </span>
                {pendingStatus && <StatusBadge status={pendingStatus} />}
              </div>

              <div>
                <label className="block text-gray-700 font-semibold mb-1">
                  {t('ordersPage.modal.reasonLabel', 'Reason for Status Override')}{' '}
                  <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={3}
                  value={reasonText}
                  onChange={(e) => {
                    setReasonText(e.target.value);
                    if (reasonError && e.target.value.trim()) {
                      setReasonError(false);
                    }
                  }}
                  placeholder={t(
                    'ordersPage.modal.reasonPlaceholder',
                    'e.g. Vendor unresponsive after 5 business days'
                  )}
                  className={`w-full p-3 rounded-lg border text-xs focus:outline-none resize-none transition-colors ${
                    reasonError
                      ? 'border-rose-400 focus:border-rose-500 focus:ring-2 focus:ring-rose-100 bg-rose-50/20'
                      : 'border-gray-200 focus:border-blue-600 focus:ring-2 focus:ring-blue-100'
                  }`}
                />
                {reasonError && (
                  <p className="text-rose-500 text-[11px] font-medium mt-1">
                    {t('ordersPage.modal.reasonRequiredError', 'Reason is required')}
                  </p>
                )}
              </div>

              {/* Quick suggestions */}
              <div>
                <span className="block text-[11px] text-gray-400 mb-1 font-medium">
                  {t('ordersPage.modal.suggestions', 'Suggestions:')}
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {quickReasons.map((qr) => {
                    const text = t(qr.key, qr.defaultText);
                    return (
                      <button
                        key={qr.key}
                        type="button"
                        onClick={() => {
                          setReasonText(text);
                          setReasonError(false);
                        }}
                        className="px-2.5 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 text-[11px] rounded-lg transition-colors cursor-pointer"
                      >
                        {text}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => {
                    setReasonModalOpen(false);
                    setPendingStatus(null);
                    setReasonError(false);
                  }}
                  className="px-4 py-2 rounded-lg text-gray-600 bg-gray-100 hover:bg-gray-200 font-semibold cursor-pointer"
                >
                  {t('ordersPage.modal.cancel', 'Cancel')}
                </button>
                <button
                  type="button"
                  onClick={handleConfirmStatusChange}
                  className="px-4 py-2 rounded-lg text-white bg-blue-600 hover:bg-blue-700 font-semibold cursor-pointer shadow-xs disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {t('ordersPage.modal.confirmStatusUpdate', 'Confirm Status Update')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
