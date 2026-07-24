import { useEffect, useState } from 'react';
import { Search, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const InputSearch = () => {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');

  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
  }, [open]);

  return (
    <>
      {/* Desktop Search */}
      <div className="hidden md:block relative w-full">
        <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--gray-400)]" />

        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          aria-label={t('search.products')}
          className="w-full bg-[var(--gray-50)] pl-8 pr-3 py-2 rounded-lg text-[var(--gray-700)] outline-none focus:ring-2 focus:ring-gray-600"
        />

        {/* animated placeholder */}
        {query === '' && (
          <div className="absolute left-8 top-1/2 -translate-y-1/2 pointer-events-none text-sm text-[var(--gray-400)]">
            {t('search.products')}
          </div>
        )}
      </div>

      {/* Mobile Button */}
      <button
        onClick={() => setOpen(true)}
        className="md:hidden flex items-center justify-center cursor-pointer"
      >
        <Search className="w-6 h-6 text-[var(--gray-50)]" />
      </button>

      {/* Mobile Bottom Sheet */}
      {open && (
        <div className="fixed inset-0 z-50" onClick={() => setOpen(false)}>
          {/* Blur background */}
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />

          {/* Sheet */}
          <div
            className="absolute bottom-0 left-0 right-0 bg-white rounded-t-2xl p-4 shadow-2xl animate-slideUp"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Handle */}
            <div className="w-12 h-1.5 bg-gray-300 rounded-full mx-auto mb-4" />

            {/* Search Input */}
            <div className="flex items-center gap-3 bg-gray-100 px-3 py-2 rounded-xl">
              <Search className="w-4 h-4 text-gray-500" />
              <input
                autoFocus
                type="text"
                placeholder={t('search.placeholder')}
                className="flex-1 bg-transparent outline-none text-gray-700"
              />
              <button onClick={() => setOpen(false)}>
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* Optional suggestions area */}
            <div className="mt-4 text-sm text-gray-500">
              {t('search.trySearching')}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default InputSearch;
