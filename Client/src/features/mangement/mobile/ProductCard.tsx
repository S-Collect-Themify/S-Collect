import { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { MoreVertical, SquarePen, Star, Trash2, Tag } from 'lucide-react';
import StatusBadge from '../StatusBadge';
import Toggle from '../Toggle';
import { THUMB_STYLES } from '../constant';
import { showDeleteConfirmation } from '../deleteConfirmation';
import type { Product } from '../mangement';

type Props = {
  product: Product;
  onToggle: () => void;
  onDelete?: () => void;
};

const ProductCard = ({ product, onToggle, onDelete }: Props) => {
  const { t, i18n } = useTranslation();
  const isAr = i18n.language === 'ar';
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const hasDiscount = Boolean(
    (product.discountPercent && product.discountPercent > 0) ||
    (product.discountValue && product.discountValue > 0)
  );

  const discountLabel =
    product.discountPercent && product.discountPercent > 0
      ? isAr
        ? `%${product.discountPercent}-`
        : `-${product.discountPercent}%`
      : product.discountValue && product.discountValue > 0
      ? isAr
        ? `-${product.discountValue} ${t('dashboardMetrics.unit.sar')}`
        : `-${product.discountValue} ${t('dashboardMetrics.unit.sar')}`
      : '';

  const thumb = THUMB_STYLES[product.category] ?? {
    bg: 'bg-gray-100',
    icon: 'text-gray-500',
  };

  useEffect(() => {
    if (!menuOpen) return;
    const handleClickOutside = (e: MouseEvent | TouchEvent) => {
      if (menuRef.current?.contains(e.target as Node)) return;
      setMenuOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [menuOpen]);

  const handleEdit = () => {
    setMenuOpen(false);
    navigate(`/edit-product/${product.id}`);
  };

  const handleDelete = () => {
    setMenuOpen(false);
    if (!onDelete) return;
    showDeleteConfirmation(
      'managementTable.deleteConfirmMessage',
      { name: product.name },
      onDelete,
      {
        titleKey: 'managementTable.deleteConfirmTitle',
        confirmKey: 'managementTable.delete',
        confirmClassName: 'bg-red-600 hover:bg-red-700',
        iconVariant: 'delete',
      }
    );
  };

  const isProductDisabled = product.isDisabled || product.status === 'Disabled';

  const handleToggle = () => {
    if (isProductDisabled) return;
    if (product.enabled) {
      showDeleteConfirmation(
        'managementTable.toggleUnpublishConfirmMessage',
        { name: product.name },
        onToggle,
        {
          titleKey: 'managementTable.toggleUnpublishConfirmTitle',
          confirmKey: 'managementTable.unpublish',
          confirmClassName: 'bg-red-600 hover:bg-red-700',
          iconVariant: 'unpublish',
        }
      );
    } else {
      showDeleteConfirmation(
        'managementTable.togglePublishConfirmMessage',
        { name: product.name },
        onToggle,
        {
          titleKey: 'managementTable.togglePublishConfirmTitle',
          confirmKey: 'managementTable.publish',
          confirmClassName: 'bg-green-600 hover:bg-green-700',
          iconVariant: 'publish',
        }
      );
    }
  };

  return (
    <div
      className={`p-4 bg-white rounded-lg shadow-sm transition-all ${!product.enabled ? 'opacity-50' : ''}`}
    >
      <div className="pb-2 md:pb-4 flex items-center justify-between md:gap-4 gap-2">
        <div className="flex items-center md:gap-3 gap-2">
          <StatusBadge status={product.status} />
        </div>
        <div className="flex items-center gap-2">
          <Toggle
            checked={product.enabled}
            onChange={handleToggle}
            disabled={isProductDisabled}
          />

          {/* Inline dropdown — works on touch without portal positioning issues */}
          <div ref={menuRef} className="relative">
            <button
              onClick={() => setMenuOpen((v) => !v)}
              aria-label={t('managementTable.actions')}
              className="w-[30px] h-[30px] flex items-center justify-center border border-gray-200 hover:bg-gray-100 transition-colors rounded-full"
            >
              <MoreVertical size={16} />
            </button>

            {menuOpen && (
              <div className="absolute right-0 top-full mt-1 z-50 bg-white border border-gray-200 rounded-lg shadow-md overflow-hidden min-w-[150px]">
                <button
                  onClick={handleEdit}
                  aria-label={t('managementTable.editProduct', {
                    name: product.name,
                  })}
                  className="flex items-center gap-2.5 px-3.5 py-2.5 text-sm cursor-pointer hover:bg-gray-50 w-full text-start"
                >
                  <SquarePen size={16} />
                  {t('managementTable.edit')}
                </button>
                {onDelete && (
                  <button
                    onClick={handleDelete}
                    aria-label={t('managementTable.deleteProduct', {
                      name: product.name,
                    })}
                    className="flex items-center gap-2.5 px-3.5 py-2.5 text-sm cursor-pointer hover:bg-red-50 text-red-600 w-full text-start border-t border-gray-100"
                  >
                    <Trash2 size={16} />
                    {t('managementTable.delete')}
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2.5">
          <div className="w-11 h-11 rounded-lg border border-gray-100 flex items-center justify-center shrink-0 overflow-hidden bg-gray-50">
            {product.icon.startsWith('http') ? (
              <img
                src={product.icon}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <i
                className={`ti ${product.icon} text-xl ${thumb.icon}`}
                aria-hidden="true"
              />
            )}
          </div>
          <div className="flex flex-col gap-0.5">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="font-medium text-gray-900">{product.name}</span>
              {hasDiscount && (
                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-600 border border-rose-100 shrink-0">
                  <Tag size={10} className="rotate-90" />
                  <span>{discountLabel}</span>
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-500 flex-wrap">
              <span>{product.categoryName || product.category}</span>
              {product.rating != null && (
                <div className="flex items-center gap-1 bg-amber-50 text-amber-700 px-1.5 py-0.5 rounded border border-amber-200/60 font-semibold text-[11px]">
                  <Star size={12} className="fill-amber-400 text-amber-400" />
                  <span>{product.rating.toFixed(1)}</span>
                  {product.ratingCount != null && (
                    <span className="text-gray-400 font-normal">({product.ratingCount})</span>
                  )}
                </div>
              )}
            </div>
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="font-medium text-gray-900">
                {product.price} {t('dashboardMetrics.unit.sar')}
              </span>
              {product.compareAtPrice && product.compareAtPrice > product.price && (
                <span className="text-xs text-gray-400 line-through font-normal">
                  {product.compareAtPrice} {t('dashboardMetrics.unit.sar')}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
