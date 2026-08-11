import { useTranslation } from 'react-i18next';
import type { StatusFilter } from './mangement';
import { STATUS_FILTERS } from './constant';
import { ChevronDown } from 'lucide-react';
import PortalDropdown from '../../components/ui/PortalDropdown';

const DD_BTN =
  'flex items-center gap-1.5 h-9 px-3 border border-gray-200 rounded-lg bg-white text-sm cursor-pointer hover:bg-gray-50 whitespace-nowrap';

const DD_ITEM =
  'flex items-center gap-2.5 px-3.5 py-2.5 text-sm cursor-pointer hover:bg-gray-50';

interface StatusDropdownProps {
  selected: StatusFilter;
  onChange: (s: StatusFilter) => void;
}

function StatusDropdown({ selected, onChange }: StatusDropdownProps) {
  const { t } = useTranslation();

  return (
    <PortalDropdown
      minWidth={180}
      animate={false}
      menuClassName="bg-white border border-gray-200 rounded-lg shadow-md overflow-hidden"
      trigger={({ isOpen, toggle }) => (
        <button className={DD_BTN} onClick={toggle}>
          {selected === 'All'
            ? t('managementTable.status')
            : t(`managementTable.statuses.${selected}`)}
          <ChevronDown
            color="black"
            size={15}
            className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : 'rotate-0'}`}
          />
        </button>
      )}
    >
      {({ close }) => (
        <>
          {STATUS_FILTERS.map((s) => (
            <div
              key={s}
              className={DD_ITEM}
              onClick={() => {
                onChange(s);
                close();
              }}
            >
              <input
                type="radio"
                readOnly
                checked={selected === s}
                aria-label={s === 'All' ? t('managementTable.allStatuses') : t(`managementTable.statuses.${s}`)}
                className="accent-black w-3.5 h-3.5 cursor-pointer"
              />
              <span>
                {s === 'All'
                  ? t('managementTable.allStatuses')
                  : t(`managementTable.statuses.${s}`)}
              </span>
            </div>
          ))}
        </>
      )}
    </PortalDropdown>
  );
}

export default StatusDropdown;
