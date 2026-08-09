import { useTranslation } from 'react-i18next';
import { MoreVertical, SquarePen, Trash } from 'lucide-react';
import StatusBadge from '../StatusBadge';
import Toggle from '../../../components/ui/Toggle';
import { showDeleteConfirmation } from '../deleteConfirmation';
import { THUMB_STYLES } from '../constant';
import type { Product } from '../mangement';
import PortalDropdown from '../../../components/ui/PortalDropdown';

type Props = {
  product: Product;
  onDelete: () => void;
  onToggle: () => void;
};

const ProductCard = ({ product, onDelete, onToggle }: Props) => {
  const { t } = useTranslation();

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
          confirmClassName: 'bg-amber-600 hover:bg-amber-700',
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
      className={`p-4 bg-white rounded-lg shadow-sm transition-all ${
        !product.enabled ? 'opacity-50' : ''
      }`}
    >
      <div className="pb-4 border-t border-gray-100 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <StatusBadge status={product.status} />
        </div>
        <div className="flex items-center gap-2">
          <Toggle checked={product.enabled} onChange={handleToggle} />
          <PortalDropdown
            align="right"
            minWidth={150}
            animate={false}
            menuClassName="bg-white border border-gray-200 rounded-lg shadow-md overflow-hidden"
            trigger={() => (
              <button
                aria-label={t('managementTable.actions')}
                className="w-7.5 h-7.5 flex items-center justify-center border border-gray-200 hover:bg-gray-100 transition-colors rounded-full"
              >
                <MoreVertical size={16} />
              </button>
            )}
          >
            {({ close }) => (
              <>
                <button
                  onClick={close}
                  aria-label={t('managementTable.editProduct', {
                    name: product.name,
                  })}
                  className="flex items-center gap-2.5 px-3.5 py-2.5 text-sm cursor-pointer hover:bg-gray-50 w-full text-start"
                >
                  <SquarePen size={16} />
                  {t('managementTable.edit')}
                </button>
                <div className="h-px bg-gray-100" />
                <button
                  onClick={() => {
                    close();
                    handleDelete();
                  }}
                  aria-label={t('managementTable.deleteProduct', {
                    name: product.name,
                  })}
                  className="flex items-center gap-2.5 px-3.5 py-2.5 text-sm cursor-pointer hover:bg-red-50 w-full text-start text-red-600"
                >
                  <Trash size={16} />
                  {t('managementTable.delete')}
                </button>
              </>
            )}
          </PortalDropdown>
        </div>
      </div>

      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2.5">
          <div
            className={`w-11 h-11 rounded-lg border border-gray-100 flex items-center justify-center shrink-0 ${thumb.bg}`}
          >
            <i
              className={`ti ${product.icon} text-xl ${thumb.icon}`}
              aria-hidden="true"
            />
          </div>
          <div className="flex flex-col">
            <span className="font-medium">{product.name}</span>
            <span className="text-sm text-gray-500">
              {t(`managementTable.categories.${product.category}`)}
            </span>
            <span className="font-medium">
              {product.price} {t('dashboardMetrics.unit.sar')}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
