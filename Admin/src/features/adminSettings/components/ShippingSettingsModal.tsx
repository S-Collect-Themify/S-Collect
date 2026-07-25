import React from 'react';
import { X } from 'lucide-react';
import ShippingSettingsForm from '../../settings/Shippingsettingsform';

interface ShippingSettingsModalProps {
  open: boolean;
  onClose: () => void;
}

export const ShippingSettingsModal: React.FC<ShippingSettingsModalProps> = ({ open, onClose }) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-3xl w-full p-6 shadow-2xl border border-gray-100 relative my-8 max-h-[90vh] overflow-y-auto">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-5 right-5 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer z-10"
        >
          <X size={20} />
        </button>

        <ShippingSettingsForm
          isConfigured={true}
          onSave={() => {
            onClose();
          }}
        />
      </div>
    </div>
  );
};
