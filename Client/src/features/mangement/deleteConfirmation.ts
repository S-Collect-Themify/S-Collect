import { createElement } from 'react';
import { createRoot } from 'react-dom/client';
import { ConfirmDeleteModal } from './ConfirmDeleteModal';

type ConfirmationOptions = {
  titleKey?: string;
  confirmKey?: string;
  confirmClassName?: string;
  iconVariant?: 'delete' | 'publish' | 'unpublish';
};

export function showDeleteConfirmation(
  messageKey: string,
  messageValues: Record<string, string | number> | undefined,
  onConfirm: () => void,
  options?: ConfirmationOptions
) {
  const container = document.createElement('div');
  document.body.appendChild(container);
  const root = createRoot(container);

  const cleanup = () => {
    root.unmount();
    if (container.parentNode) {
      container.parentNode.removeChild(container);
    }
  };

  root.render(
    createElement(ConfirmDeleteModal, {
      messageKey,
      messageValues,
      onConfirm: () => {
        onConfirm();
        cleanup();
      },
      onClose: cleanup,
      ...options,
    })
  );
}
