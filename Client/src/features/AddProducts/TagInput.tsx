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
      <label className="mb-2 block font-medium">
        {label} {required && <span className="text-red-500">*</span>}
      </label>

      <div className="flex flex-col gap-3 md:flex-row md:items-center">
        {items.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {items.map((item, index) => (
              <span
                key={index}
                className="inline-flex items-center gap-1 rounded-lg bg-[#E9E9E9] px-3 py-2 text-sm"
              >
                {item}
                <button
                  onClick={() => onRemove(index)}
                  className="ml-1 rounded-full p-0.5 hover:bg-gray-200"
                >
                  <X size={14} />
                </button>
              </span>
            ))}
          </div>
        )}

        {show ? (
          <div className="flex flex-col gap-2 sm:flex-row">
            <input
              autoFocus
              className="min-w-0 flex-1 rounded-xl border border-gray-300 px-4 py-2 focus:border-gray-950 focus:outline-none"
              value={value}
              placeholder={placeholder}
              onChange={(e) => setValue(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleAdd()}
            />
            <button
              onClick={handleAdd}
              className="rounded-xl bg-gray-950 px-4 py-2 text-white"
            >
              {addBtnLabel}
            </button>
            <button
              onClick={() => {
                setShow(false);
                setValue('');
              }}
              className="rounded-xl border border-gray-300 px-4 py-2"
            >
              {cancelBtnLabel}
            </button>
          </div>
        ) : (
          <button
            onClick={() => setShow(true)}
            className="flex w-fit cursor-pointer items-center gap-2 rounded-lg border border-dashed border-gray-300 px-3 py-2 text-gray-600 transition hover:border-gray-950 hover:text-gray-950"
          >
            <Plus size={15} /> {addLabel}
          </button>
        )}
      </div>
    </div>
  );
};

export default TagInput;
