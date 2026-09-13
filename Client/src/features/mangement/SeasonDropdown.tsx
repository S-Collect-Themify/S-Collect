import { useTranslation } from 'react-i18next';
import { ChevronDown } from 'lucide-react';
import PortalDropdown from '../../components/ui/PortalDropdown';

const DD_BTN =
  'flex items-center gap-1.5 h-9 px-3 border border-gray-200 rounded-lg bg-white text-sm cursor-pointer hover:bg-gray-50 whitespace-nowrap';

const DD_ITEM =
  'flex items-center gap-2.5 px-3.5 py-2.5 text-sm cursor-pointer hover:bg-gray-50';

export type SeasonFilterValue = 'all' | 'summer' | 'winter';

const SEASONS: SeasonFilterValue[] = ['all', 'summer', 'winter'];

interface SeasonDropdownProps {
  selected: SeasonFilterValue;
  onChange: (s: SeasonFilterValue) => void;
}

function SeasonDropdown({ selected, onChange }: SeasonDropdownProps) {
  const { t } = useTranslation();

  const seasonLabel = (s: SeasonFilterValue) =>
    s === 'all'
      ? t('addProduct.seasonAll', 'All Seasons')
      : s === 'summer'
        ? t('addProduct.seasonSummer', 'Summer')
        : t('addProduct.seasonWinter', 'Winter');

  return (
    <PortalDropdown
      minWidth={160}
      animate={false}
      menuClassName="bg-white border border-gray-200 rounded-lg shadow-md overflow-hidden"
      trigger={({ isOpen, toggle }) => (
        <button className={DD_BTN} onClick={toggle}>
          {selected === 'all' ? t('managementTable.season', 'Season') : seasonLabel(selected)}
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
          {SEASONS.map((s) => (
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
                className="accent-black w-3.5 h-3.5 cursor-pointer"
              />
              <span>{seasonLabel(s)}</span>
            </div>
          ))}
        </>
      )}
    </PortalDropdown>
  );
}

export default SeasonDropdown;
