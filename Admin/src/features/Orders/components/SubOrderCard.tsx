import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ChevronDown, Edit2, ExternalLink, Check, X, Loader2, MessageSquare } from 'lucide-react';
import type { AdminSubOrder } from '../../../services/orders';
import PortalDropdown from '../../../components/ui/PortalDropdown';

interface SubOrderCardProps {
  subOrder: AdminSubOrder;
  vendorName: string;
  orderId?: string;
  onUpdateStatus: (payload: { status: string; trackingNumber?: string; reason?: string }) => Promise<void> | void;
  isUpdating?: boolean;
  StatusBadge: React.ComponentType<{ status?: string }>;
  getProductThumbnail: (name?: string) => string;
}

export const SubOrderCard = ({
  subOrder,
  vendorName,
  onUpdateStatus,
  isUpdating = false,
  StatusBadge,
  getProductThumbnail,
}: SubOrderCardProps) => {
  const { t, i18n } = useTranslation();
  const isRtl = i18n.language === 'ar';

  const defaultTracking = typeof subOrder.trackingNumber === 'string' && subOrder.trackingNumber ? subOrder.trackingNumber : '12390AA18123456784';
  const defaultReason = typeof subOrder.statusOverrideReason === 'string' ? subOrder.statusOverrideReason : '';

  const [trackingNumber, setTrackingNumber] = useState(defaultTracking);
  const [isEditingTracking, setIsEditingTracking] = useState(false);
  const [reasonModalOpen, setReasonModalOpen] = useState(false);
  const [pendingStatus, setPendingStatus] = useState<string | null>(null);
  const [reasonText, setReasonText] = useState(defaultReason);

  const statusOptions = ['PENDING', 'PROCESSING', 'PARTIALLY_SHIPPED', 'SHIPPED', 'DELIVERED', 'CANCELLED'];

  const quickReasons = [
    'Vendor unresponsive after 5 business days',
    'Item out of stock',
    'Courier shipping delay',
    'Manual admin status update',
  ];

  const handleSaveTracking = async () => {
    setIsEditingTracking(false);
    await onUpdateStatus({
      status: subOrder.status,
      trackingNumber,
      reason: reasonText || undefined,
    });
  };

  const handleStatusSelect = (st: string) => {
    if (st === subOrder.status) return;
    setPendingStatus(st);
    setReasonModalOpen(true);
  };

  const handleConfirmStatusChange = async () => {
    if (!pendingStatus) return;
    setReasonModalOpen(false);
    await onUpdateStatus({
      status: pendingStatus,
      trackingNumber,
      reason: reasonText || undefined,
    });
    setPendingStatus(null);
  };

  const currentItems = subOrder.items || [];
  const subtotal = currentItems.reduce((acc, i) => acc + (i.lineTotal || 0), 0);

  return (
    <div className="p-4 rounded-2xl border border-gray-200/70 bg-white space-y-4 relative">
      {isUpdating && (
        <div className="absolute inset-0 bg-white/70 backdrop-blur-[1px] rounded-2xl z-20 flex items-center justify-center gap-2 text-xs font-semibold text-blue-600">
          <Loader2 className="animate-spin" size={18} />
          <span>Updating sub-order...</span>
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
        <div className="bg-amber-50/70 border border-amber-200/60 rounded-xl p-2.5 flex items-start gap-2 text-xs text-amber-800">
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
              disabled={!isEditingTracking}
              onChange={(e) => setTrackingNumber(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && isEditingTracking) {
                  handleSaveTracking();
                }
              }}
              className={`w-full py-2 rounded-xl border text-xs font-mono transition-colors ${
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
                  onClick={() => setIsEditingTracking(true)}
                  title="Edit tracking number"
                  className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
                >
                  <Edit2 size={13} />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Change Status */}
        <div>
          <label className="block text-[11px] text-gray-400 mb-1 font-medium">
            {t('ordersPage.changeStatus', 'Change Status')}
          </label>
          <PortalDropdown
            minWidth={160}
            animate={false}
            menuClassName="bg-white border border-gray-200 rounded-xl shadow-md overflow-hidden z-50 py-1"
            trigger={({ isOpen, toggle }) => (
              <button
                type="button"
                onClick={toggle}
                className="w-full flex items-center justify-between py-2 px-3 rounded-xl border border-gray-200 text-xs text-gray-800 bg-gray-50/50 hover:bg-white focus:outline-none cursor-pointer transition-colors"
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
          className="text-[11px] text-blue-600 font-semibold hover:underline flex items-center gap-1 cursor-pointer"
        >
          <span>{t('ordersPage.viewProduct', 'View Product')}</span>
          <ExternalLink size={11} />
        </button>
      </div>

      {/* Sub-order Items List */}
      <div className="space-y-3 pt-2 border-t border-gray-100">
        {currentItems.map((it) => (
          <div key={it.id} className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gray-100 border border-gray-100 shrink-0 flex items-center justify-center text-base">
                {getProductThumbnail(it.productName)}
              </div>
              <div>
                <p className="font-bold text-gray-900">{it.productName}</p>
                <p className="text-gray-400 text-[11px]">
                  {t('ordersPage.qtyColon', 'Qty:')} {it.quantity}
                </p>
              </div>
            </div>
            <span className="font-bold text-gray-900 text-xs">{(it.lineTotal || 0).toFixed(2)} SAR</span>
          </div>
        ))}
      </div>

      <div className="pt-2 border-t border-gray-100 text-end text-xs space-y-0.5 text-gray-500">
        <p>
          {t('ordersPage.subtotalColon', 'Subtotal:')}{' '}
          <span className="font-semibold text-gray-900">{subtotal.toFixed(2)} SAR</span>
        </p>
        <p>
          {t('ordersPage.shippingColon', 'Shipping:')}{' '}
          <span className="font-semibold text-gray-900">{(subOrder.shippingRateApplied || 0).toFixed(2)} SAR</span>
        </p>
      </div>

      {/* Reason Dialog / Modal */}
      {reasonModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-5 max-w-md w-full shadow-2xl border border-gray-100 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-gray-900 text-base">Update Sub-Order Status</h3>
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
              <div className="bg-gray-50 rounded-xl p-3 flex justify-between items-center">
                <span className="text-gray-500 font-medium">New Status:</span>
                {pendingStatus && <StatusBadge status={pendingStatus} />}
              </div>

              <div>
                <label className="block text-gray-700 font-semibold mb-1">
                  Reason for Status Override (Optional)
                </label>
                <textarea
                  rows={3}
                  value={reasonText}
                  onChange={(e) => setReasonText(e.target.value)}
                  placeholder="e.g. Vendor unresponsive after 5 business days"
                  className="w-full p-3 rounded-xl border border-gray-200 text-xs focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                />
              </div>

              {/* Quick suggestions */}
              <div>
                <span className="block text-[11px] text-gray-400 mb-1 font-medium">Suggestions:</span>
                <div className="flex flex-wrap gap-1.5">
                  {quickReasons.map((qr) => (
                    <button
                      key={qr}
                      type="button"
                      onClick={() => setReasonText(qr)}
                      className="px-2.5 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 text-[11px] rounded-lg transition-colors cursor-pointer"
                    >
                      {qr}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => {
                    setReasonModalOpen(false);
                    setPendingStatus(null);
                  }}
                  className="px-4 py-2 rounded-xl text-gray-600 bg-gray-100 hover:bg-gray-200 font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmStatusChange}
                  className="px-4 py-2 rounded-xl text-white bg-blue-600 hover:bg-blue-700 font-semibold cursor-pointer shadow-xs"
                >
                  Confirm Status Update
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
