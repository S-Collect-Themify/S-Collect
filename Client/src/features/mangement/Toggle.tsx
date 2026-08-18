type Props = {
  checked: boolean;
  onChange: () => void;
  disabled?: boolean;
};

export default function Toggle({ checked, onChange, disabled }: Props) {
  return (
    <label
      className={`relative inline-flex items-center w-10 h-[22px] shrink-0 ${
        disabled ? 'cursor-not-allowed opacity-40' : 'cursor-pointer'
      }`}
    >
      <input
        type="checkbox"
        checked={checked}
        onChange={disabled ? undefined : onChange}
        disabled={disabled}
        className="sr-only peer"
      />
      <div
        className={`absolute inset-0 rounded-full transition-colors duration-200 ${
          disabled
            ? 'bg-gray-300'
            : 'bg-gray-300 peer-checked:bg-green-500'
        }`}
      />
      <div className="absolute w-4 h-4 bg-white rounded-full top-[3px] left-[3px] shadow-sm transition-transform duration-200 peer-checked:translate-x-[18px]" />
    </label>
  );
}
