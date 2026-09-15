import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { GripVertical, SquarePen, Trash2, ChevronDown } from 'lucide-react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { FaqItem } from '../types';

interface FaqItemRowProps {
  item: FaqItem;
  onEdit: (item: FaqItem) => void;
  onDelete: (item: FaqItem) => void;
}

export const FaqItemRow = ({ item, onEdit, onDelete }: FaqItemRowProps) => {
  const { i18n } = useTranslation();
  const isAr = i18n.language === 'ar';
  const [expanded, setExpanded] = useState(false);

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: item.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.6 : 1,
  };

  const question = isAr ? item.question.ar || item.question.en : item.question.en || item.question.ar;
  const answer = isAr ? item.answer.ar || item.answer.en : item.answer.en || item.answer.ar;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="border border-gray-100 rounded-xl bg-white overflow-hidden"
    >
      <div className="flex items-center gap-2 px-3 py-3">
        <button
          type="button"
          {...attributes}
          {...listeners}
          className="cursor-grab active:cursor-grabbing p-1 text-gray-400 hover:text-gray-600 transition-colors rounded shrink-0"
        >
          <GripVertical size={16} />
        </button>

        <button
          type="button"
          onClick={() => setExpanded((prev) => !prev)}
          className="flex-1 flex items-center justify-between gap-2 text-start cursor-pointer min-w-0"
        >
          <span className="text-sm font-semibold text-gray-900 truncate">
            {question || '—'}
          </span>
          <ChevronDown
            size={16}
            className={`shrink-0 text-gray-400 transition-transform ${expanded ? 'rotate-180' : ''}`}
          />
        </button>

        <div className="flex items-center gap-1 shrink-0">
          <button
            type="button"
            onClick={() => onEdit(item)}
            className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-black transition-colors cursor-pointer"
          >
            <SquarePen size={15} />
          </button>
          <button
            type="button"
            onClick={() => onDelete(item)}
            className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 transition-colors cursor-pointer"
          >
            <Trash2 size={15} />
          </button>
        </div>
      </div>

      {expanded && (
        <div className="px-4 pb-3.5 pt-0 ps-11">
          <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">
            {answer || '—'}
          </p>
        </div>
      )}
    </div>
  );
};
