const cardCls =
  'bg-white/50 border border-gray-200 rounded-lg overflow-visible transition-all duration-300 ease-out';

function FieldSkeleton({
  labelWidth = 'w-20',
  inputHeight = 'h-10',
  className,
}: {
  labelWidth?: string;
  inputHeight?: string;
  className?: string;
}) {
  return (
    <div className={className}>
      <div
        className={`h-3 ${labelWidth} bg-gray-200 rounded mb-1.5 animate-pulse`}
      />
      <div
        className={`w-full ${inputHeight} bg-gray-200 rounded-lg animate-pulse`}
      />
    </div>
  );
}

export function StoreProfileFormSkeleton() {
  return (
    <div className="space-y-4">
      {/* Store preview card */}
      <div className="settings-surface-enter settings-stagger-1 mb-5">
        <div className="h-3 w-20 bg-gray-200 rounded mb-3 animate-pulse" />
        <div className="border border-[#E9E9E9] rounded-lg bg-white/50 p-3 md:p-5">
          <div className="flex items-center md:items-start gap-3 md:gap-5 animate-pulse">
            <div className="w-14 h-14 md:w-20 md:h-20 shrink-0 rounded-full bg-gray-200" />
            <div className="min-w-0 flex-1 space-y-2">
              <div className="h-4 w-32 bg-gray-200 rounded" />
              <div className="h-3 w-56 bg-gray-200 rounded" />
              <div className="h-3 w-40 bg-gray-200 rounded" />
            </div>
          </div>
        </div>
      </div>

      {/* Store name */}
      <div className="settings-surface-enter settings-stagger-2 mb-4">
        <FieldSkeleton labelWidth="w-24" />
      </div>

      {/* Logo upload */}
      <div className="settings-surface-enter settings-stagger-2 mb-4">
        <div className="h-3 w-20 bg-gray-200 rounded mb-3 animate-pulse" />
        <div className="h-28 w-full border-2 border-dashed border-gray-200 bg-gray-50 rounded-lg animate-pulse" />
      </div>

      {/* Description */}
      <div className="settings-surface-enter settings-stagger-3 mb-4 md:mb-6">
        <div className="h-4 w-28 bg-gray-200 rounded mb-3 animate-pulse" />
        <div className="h-[140px] w-full bg-gray-200 rounded-lg animate-pulse" />
      </div>

      {/* Contact information */}
      <div className="settings-surface-enter settings-stagger-3 mb-4 md:mb-6">
        <div className="h-5 w-36 bg-gray-200 rounded mb-3 animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FieldSkeleton labelWidth="w-20" />
          <FieldSkeleton labelWidth="w-24" />
        </div>
      </div>

      {/* Save button */}
      <div className="settings-surface-enter settings-stagger-3 flex justify-center md:justify-end">
        <div className="h-11 w-[130px] bg-gray-200 rounded-lg animate-pulse" />
      </div>
    </div>
  );
}

export function AccountSettingsFormSkeleton() {
  return (
    <div className="space-y-3 settings-surface-enter">
      {/* Personal information section */}
      <div className={cardCls}>
        <div className="md:p-5 px-4 py-6">
          <div className="h-5 w-44 bg-gray-200 rounded animate-pulse" />
          <div className="h-3 w-72 bg-gray-200 rounded mt-2 mb-4 animate-pulse" />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <FieldSkeleton labelWidth="w-20" />
            <FieldSkeleton labelWidth="w-20" />
          </div>

          <div className="mb-4">
            <div className="h-3 w-20 bg-gray-200 rounded mb-1.5 animate-pulse" />
            <div className="h-10 w-full bg-gray-200 rounded-md animate-pulse" />
            <div className="h-3 w-32 bg-gray-100 rounded mt-1 animate-pulse" />
          </div>

          <div>
            <div className="h-3 w-24 bg-gray-200 rounded mb-1.5 animate-pulse" />
            <div className="h-10 w-full bg-gray-200 rounded-lg animate-pulse" />
          </div>
        </div>
      </div>

      {/* Change password section */}
      <div className={cardCls}>
        <div className="md:p-5 px-4 py-6">
          <div className="flex items-start justify-between">
            <div>
              <div className="h-5 w-32 bg-gray-200 rounded animate-pulse" />
              <div className="h-3 w-64 bg-gray-200 rounded mt-2 animate-pulse" />
            </div>
            <div className="h-5 w-5 bg-gray-200 rounded mt-0.5 animate-pulse" />
          </div>
        </div>
      </div>

      {/* Save button */}
      <div className="flex justify-center md:justify-end pt-1">
        <div className="h-11 w-32.5 bg-gray-200 rounded-lg animate-pulse" />
      </div>
    </div>
  );
}

export function BankAccountFormSkeleton() {
  return (
    <div className="w-full max-w-2xl rounded-2xl border border-gray-200 bg-white p-6 animate-pulse">
      <div className="h-6 w-48 bg-gray-200 rounded" />
      <div className="mt-2 h-4 w-72 bg-gray-200 rounded" />
      <div className="mt-4 h-16 w-full bg-gray-100 rounded-xl" />
      <div className="mt-6">
        <FieldSkeleton labelWidth="w-24" />
      </div>
      <div className="mt-6">
        <FieldSkeleton labelWidth="w-16" />
      </div>
      <div className="mt-6">
        <FieldSkeleton labelWidth="w-36" />
      </div>
      <div className="mt-8 flex justify-center md:justify-end gap-3">
        <div className="h-10 w-32 bg-gray-200 rounded-xl" />
        <div className="h-10 w-24 bg-gray-200 rounded-xl" />
      </div>
    </div>
  );
}
