import { useEffect, useState, useRef } from 'react';
import { ChevronDown, X, Check } from 'lucide-react';

export interface CategoryMultiSelectProps {
  value: string[];
  onChange: (value: string[]) => void;
  categories: any[];
  isLoading?: boolean;
  error?: boolean;
  language: string;
  placeholder: string;
}

export function CategoryMultiSelect({
  value = [],
  onChange,
  categories = [],
  isLoading = false,
  error = false,
  language,
  placeholder,
}: CategoryMultiSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getCategoryName = (cat: any): string => {
    if (!cat) return '';
    if (typeof cat === 'string') return cat;
    if (typeof cat === 'number') return String(cat);

    if (typeof cat.name === 'object' && cat.name !== null) {
      return (
        (language === 'ar' ? cat.name.ar || cat.name.en : cat.name.en || cat.name.ar) ||
        JSON.stringify(cat.name)
      );
    }

    if (language === 'ar') {
      if (cat.nameAr && typeof cat.nameAr === 'string') return cat.nameAr;
      if (cat.name_ar && typeof cat.name_ar === 'string') return cat.name_ar;
    } else {
      if (cat.nameEn && typeof cat.nameEn === 'string') return cat.nameEn;
      if (cat.name_en && typeof cat.name_en === 'string') return cat.name_en;
    }

    if (cat.name && typeof cat.name === 'string') return cat.name;
    if (cat.title && typeof cat.title === 'string') return cat.title;
    if (cat.categoryName && typeof cat.categoryName === 'string') return cat.categoryName;
    if (cat.slug && typeof cat.slug === 'string') return cat.slug;
    if (cat.id) return String(cat.id);
    if (cat._id) return String(cat._id);

    return String(cat);
  };

  const allCategoryNames = categories.map(getCategoryName).filter(Boolean);

  const toggleCategory = (catName: string) => {
    if (!catName) return;
    const exists = value.some((v) => String(v).toLowerCase() === catName.toLowerCase());
    let newValue: string[];
    if (exists) {
      newValue = value.filter((v) => String(v).toLowerCase() !== catName.toLowerCase());
    } else {
      newValue = [...value, catName];
    }
    onChange(newValue);
  };

  const removeCategory = (catName: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const newValue = value.filter((v) => String(v).toLowerCase() !== catName.toLowerCase());
    onChange(newValue);
  };

  const isAllSelected =
    allCategoryNames.length > 0 &&
    allCategoryNames.every((name) =>
      value.some((v) => String(v).toLowerCase() === name.toLowerCase())
    );

  const toggleSelectAll = () => {
    if (isAllSelected) {
      onChange([]);
    } else {
      onChange([...allCategoryNames]);
    }
  };

  return (
    <div ref={containerRef} className="relative w-full">
      <div
        onClick={() => !isLoading && setIsOpen(!isOpen)}
        className={`w-full min-h-10.5 px-3 py-1.5 bg-white border rounded-xl flex items-center justify-between gap-2 cursor-pointer transition-all ${
          error
            ? 'border-red-500 ring-2 ring-red-500/10'
            : isOpen
            ? 'border-gray-400 ring-2 ring-black/5'
            : 'border-gray-200 hover:border-gray-300'
        } ${isLoading ? 'bg-gray-50 opacity-60 cursor-not-allowed' : ''}`}
      >
        <div className="flex flex-wrap items-center gap-1.5 flex-1 min-w-0">
          {value.length === 0 ? (
            <span className="text-sm text-gray-400 font-normal px-1">{placeholder}</span>
          ) : (
            value.map((catName) => (
              <span
                key={catName}
                className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-gray-100 text-gray-800 text-xs font-semibold border border-gray-200 animate-in fade-in duration-150"
              >
                <span>{catName}</span>
                <button
                  type="button"
                  onClick={(e) => removeCategory(catName, e)}
                  className="hover:text-red-500 transition-colors cursor-pointer rounded-full p-0.5"
                >
                  <X size={12} />
                </button>
              </span>
            ))
          )}
        </div>
        <div className="flex items-center gap-1 shrink-0 text-gray-400">
          {value.length > 0 && (
            <span className="text-[11px] font-bold bg-gray-900 text-white rounded-full px-1.5 py-0.2">
              {value.length}
            </span>
          )}
          <ChevronDown
            size={16}
            className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
          />
        </div>
      </div>

      {isOpen && !isLoading && (
        <div className="absolute z-50 left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-xl max-h-60 overflow-y-auto p-1.5 text-sm animate-in fade-in slide-in-from-top-2 duration-150">
          {categories.length > 0 && (
            <div
              onClick={toggleSelectAll}
              className="flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-gray-50 cursor-pointer font-semibold text-gray-900 border-b border-gray-100 mb-1 select-none"
            >
              <div
                className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${
                  isAllSelected
                    ? 'bg-black border-black text-white'
                    : 'border-gray-300 bg-white'
                }`}
              >
                {isAllSelected && <Check size={12} strokeWidth={3} />}
              </div>
              <span>
                {language === 'ar' ? 'تحديد الكل' : 'Select All'}
              </span>
            </div>
          )}

          {categories.length === 0 ? (
            <div className="p-3 text-center text-xs text-gray-400">
              {language === 'ar' ? 'لا توجد فئات متاحة' : 'No categories available'}
            </div>
          ) : (
            categories.map((cat) => {
              const catName = getCategoryName(cat);
              const isSelected = value.some(
                (v) => String(v).toLowerCase() === catName.toLowerCase()
              );
              return (
                <div
                  key={cat.id || cat._id || catName}
                  onClick={() => toggleCategory(catName)}
                  className={`flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors select-none ${
                    isSelected ? 'bg-gray-50/80 font-semibold text-gray-900' : 'text-gray-700'
                  }`}
                >
                  <div
                    className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${
                      isSelected
                        ? 'bg-black border-black text-white'
                        : 'border-gray-300 bg-white'
                    }`}
                  >
                    {isSelected && <Check size={12} strokeWidth={3} />}
                  </div>
                  <span>{catName}</span>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
