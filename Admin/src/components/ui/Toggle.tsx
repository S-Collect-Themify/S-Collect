import { Switch } from '@headlessui/react';

interface ToggleProps {
  checked: boolean;
  onChange: (v: boolean) => void;
}

export default function Toggle({ checked, onChange }: ToggleProps) {
  return (
    <Switch
      checked={checked}
      onChange={onChange}
      className={`${
        checked ? 'bg-green-500' : 'bg-gray-300'
      } relative inline-flex h-6 w-11 items-center cursor-pointer rounded-full transition-colors`}
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
