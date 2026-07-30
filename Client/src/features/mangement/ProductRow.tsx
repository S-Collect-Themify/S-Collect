import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { SquarePen, Trash, Check, Star } from 'lucide-react';
import Toggle from './Toggle';
import StatusBadge from './StatusBadge';
import { showDeleteConfirmation } from './deleteConfirmation';
import { THUMB_STYLES } from './constant';
import type { Product } from './mangement';

type Props = {
  product: Product;
  selected: boolean;
  onSelect: () => void;
  onDelete: () => void;
  onToggle: () => void;
};

export default function ProductRow({
  product,
  selected,
  onSelect,
  onDelete,
  onToggle,
}: Props) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const thumb = THUMB_STYLES[product.category] ?? {
    bg: 'bg-gray-100',
    icon: 'text-gray-500',
  };

  const handleDelete = () => {
    showDeleteConfirmation(
      'managementTable.deleteConfirmMessage',
      { name: product.name },
      onDelete
    );
  };

  const handleToggle = () => {
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
    <tr
      className={`transition-all bg-white ${!product.enabled ? 'opacity-50' : ''} ${
        selected
          ? 'hover:bg-gray-50 shadow-[inset_3px_0_0_0_#111827]'
          : 'hover:bg-gray-50'
      }`}
    >
      <td className="px-3 py-3 border-b border-gray-100 text-start">
        <label className="inline-flex items-center justify-center w-4 h-4 cursor-pointer">
          <input
            type="checkbox"
            checked={selected}
            onChange={onSelect}
            className="peer sr-only"
          />
          <span
            className="w-4 h-4 rounded-[4px] border border-gray-300 bg-white
                       flex items-center justify-center
                       peer-checked:bg-gray-900 peer-checked:border-gray-900
                       transition-colors"
          >
            {selected && (
              <Check className="text-white" size={11} strokeWidth={3} />
            )}
          </span>
        </label>
      </td>

      <td className="px-3 py-3 border-b border-gray-100">
        {/* Flex container maintains visual order; direction is inherited */}
        <div className="flex items-center gap-2.5">
          <div className="w-11 h-11 rounded-lg border border-gray-100 flex items-center justify-center flex-shrink-0 overflow-hidden bg-gray-50">
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
          <span className="font-semibold text-gray-900">{product.name}</span>
        </div>
      </td>

      <td className="px-3 py-3 border-b border-gray-100 font-semibold text-gray-500">
        {product.categoryName || product.category}
      </td>

      <td className="px-3 py-3 border-b border-gray-100 font-semibold text-gray-900">
        {product.price} {t('dashboardMetrics.unit.sar')}
      </td>

      <td className="px-3 py-3 border-b border-gray-100">
        <div className="flex items-center gap-1">
          <Star size={14} className="fill-amber-400 text-amber-400" />
          <span className="font-semibold text-gray-900">
            {product.rating != null ? product.rating.toFixed(1) : '—'}
          </span>
          <span className="font-semibold text-gray-900 text-xs">
            {product.ratingCount != null ? `(${product.ratingCount})` : ''}
          </span>
        </div>
      </td>

      <td className="px-3 py-3 border-b border-gray-100">
        <StatusBadge status={product.status} />
      </td>

      <td className="px-3 py-3 border-b border-gray-100">
        <Toggle checked={product.enabled} onChange={handleToggle} />
      </td>

      <td className="px-3 py-3 border-b border-gray-100">
        {/* Action buttons maintain correct alignment through natural flow */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={handleDelete}
            aria-label={t('managementTable.deleteProduct', {
              name: product.name,
            })}
            className="w-[30px] h-[30px] flex items-center justify-center border border-gray-200  hover:bg-red-50 hover:border-red-200 transition-colors rounded-full"
          >
            <Trash className="text-red-500" size={16} />
          </button>
          <button
            onClick={() => navigate(`/edit-product/${product.id}`)}
            aria-label={t('managementTable.editProduct', {
              name: product.name,
            })}
            className="w-[30px] h-[30px] flex items-center justify-center border border-gray-200  hover:bg-gray-100 transition-colors rounded-full"
          >
            <SquarePen size={16} />
          </button>
        </div>
      </td>
    </tr>
  );
}
