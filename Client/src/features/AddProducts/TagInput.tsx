// pages/AddProduct/TagInput.tsx
import { useState } from 'react';
import { Plus, X } from 'lucide-react';

interface TagInputProps {
  label: string;
  required?: boolean;
  items: string[];
  onAdd: (value: string) => void;
  onRemove: (index: number) => void;
  placeholder?: string;
  addLabel?: string;
  addBtnLabel?: string;
  cancelBtnLabel?: string;
}

const TagInput = ({
  label,
  required,
  items,
  onAdd,
  onRemove,
  placeholder = 'Enter value',
  addLabel = 'Add',
  addBtnLabel = 'Add',
  cancelBtnLabel = 'Cancel',
}: TagInputProps) => {
  const [show, setShow] = useState(false);
  const [value, setValue] = useState('');

  const handleAdd = () => {
    const trimmed = value.trim();
    if (trimmed && !items.includes(trimmed)) {
      onAdd(trimmed);
      setValue('');
      setShow(false);
    }
  };

  return (
    <div>
      <label className="mb-2 block text-xs font-semibold text-gray-800">
        {label} {required && <span className="text-red-500">*</span>}
      </label>

      <div className="flex flex-wrap items-center gap-2">
        {items.length > 0 && (
          <>
            {items.map((item, index) => (
              <span
                key={index}
                className="inline-flex items-center gap-1.5 rounded-lg bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-800"
              >
                {item}
                <button
                  type="button"
                  onClick={() => onRemove(index)}
                  className="rounded-full p-0.5 text-gray-500 hover:bg-gray-200 hover:text-gray-900 transition-colors"
                >
                  <X size={12} />
                </button>
              </span>
            ))}
          </>
        )}

        {show ? (
          <div className="flex flex-col gap-2 sm:flex-row">
            <input
              autoFocus
              className="min-w-0 flex-1 rounded-lg border border-gray-300 px-3 py-1 text-xs focus:border-gray-950 focus:outline-none"
              value={value}
              placeholder={placeholder}
              onChange={(e) => setValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAdd();
                }
              }}
            />
            <button
              type="button"
              onClick={handleAdd}
              className="rounded-lg bg-gray-950 px-3 py-1 text-xs text-white hover:bg-gray-800"
            >
              {addBtnLabel}
            </button>
            <button
              type="button"
              onClick={() => {
                setShow(false);
                setValue('');
              }}
              className="rounded-lg border border-gray-300 px-3 py-1 text-xs"
            >
              {cancelBtnLabel}
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setShow(true)}
            className="flex w-fit cursor-pointer items-center gap-1 rounded-lg border border-dashed border-gray-300 px-3 py-1 text-xs font-medium text-gray-600 transition hover:border-gray-950 hover:text-gray-950"
          >
            <Plus size={13} /> {addLabel}
          </button>
        )}
      </div>
    </div>
  );
};

export default TagInput;
