import { Switch } from '@headlessui/react';

interface ToggleProps {
  checked: boolean;
  onChange: (v: boolean) => void;
  disabled?: boolean;
  'aria-label'?: string;
}

export default function Toggle({ checked, onChange, disabled, 'aria-label': ariaLabel }: ToggleProps) {
  return (
    <Switch
      checked={checked}
      onChange={disabled ? () => {} : onChange}
      disabled={disabled}
      aria-label={ariaLabel || 'Toggle status'}
      className={`${
        checked ? 'bg-green-500' : 'bg-gray-400'
      } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'} relative inline-flex h-6 w-11 items-center rounded-full transition-colors`}
    >
      <span
        className={`${
          checked
            ? 'translate-x-6 rtl:-translate-x-6'
            : 'translate-x-1 rtl:-translate-x-1'
        } inline-block h-4 w-4 transform rounded-full bg-white transition`}
      />
    </Switch>
  );
}
