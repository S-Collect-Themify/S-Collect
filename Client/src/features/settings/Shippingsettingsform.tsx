import { useForm } from "react-hook-form";
import { AlertTriangle, Info, RotateCcw } from "lucide-react";
import { useTranslation } from "react-i18next";

export interface ShippingSettingsValues {
  flatRate: number;
  regionalRates: Record<string, number | undefined>;
}

export interface Region {
  id: string;
  label: string;
}

export interface ShippingSettingsFormProps {
  regions?: Region[];
  defaultValues?: Partial<ShippingSettingsValues>;
  currency?: string;
  isConfigured?: boolean;
  isPending?: boolean;
  onSave?: (values: ShippingSettingsValues) => void | Promise<void>;
  onReset?: () => void;
}

// eslint-disable-next-line react-refresh/only-export-components
export const regionIdToZoneCode = (id: string): string => {
  return id.toUpperCase().replace(/-/g, '_');
};

// eslint-disable-next-line react-refresh/only-export-components
export const zoneCodeToRegionId = (code: string): string => {
  return code.toLowerCase().replace(/_/g, '-');
};

// eslint-disable-next-line react-refresh/only-export-components
export const SAUDI_REGIONS: Region[] = [
  { id: "riyadh", label: "Riyadh" },
  { id: "makkah", label: "Makkah" },
  { id: "madinah", label: "Madinah" },
  { id: "eastern-province", label: "Eastern Province" },
  { id: "qassim", label: "Qassim" },
  { id: "asir", label: "Asir" },
  { id: "tabuk", label: "Tabuk" },
  { id: "hail", label: "Hail" },
  { id: "northern-borders", label: "Northern Borders" },
  { id: "jazan", label: "Jazan" },
  { id: "najran", label: "Najran" },
  { id: "al-bahah", label: "Al Bahah" },
  { id: "al-jouf", label: "Al Jouf" },
];

export default function ShippingSettingsForm({
  regions = [],
  defaultValues,
  currency = "SAR",
  isConfigured = false,
  isPending = false,
  onSave,
  onReset,
}: ShippingSettingsFormProps) {
  const { t } = useTranslation();

  const values: ShippingSettingsValues = {
    flatRate: defaultValues?.flatRate ?? 0,
    regionalRates: defaultValues?.regionalRates ?? {},
  };

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isValid },
  } = useForm<ShippingSettingsValues>({
    values: values,
    mode: "onBlur",
  });

  const onSubmit = (data: ShippingSettingsValues) => {
    onSave?.(data);
  };

  const handleReset = () => {
    reset(values);
    onReset?.();
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="w-full max-w-[720px] rounded-lg md:rounded-2xl border border-gray-200 bg-white p-3 md:p-6"
    >
      <h2 className="text-xl font-semibold text-gray-900">
        {t("settings.shippingForm.title")}
      </h2>
      <p className="mt-1.5 text-sm text-gray-500">
        {t("settings.shippingForm.description")}
      </p>

      {!isConfigured && (
        <div className="mt-4 flex gap-2.5 rounded-xl border border-amber-200 bg-amber-50 p-3.5">
          <AlertTriangle
            size={16}
            className="mt-0.5 shrink-0 text-amber-500"
          />
          <p className="text-sm text-amber-700">
            {t("settings.shippingForm.warning")}
          </p>
        </div>
      )}

      {/* Flat rate */}
      <div className="mt-3 md:mt-6">
        <label htmlFor="flatRate" className="text-sm font-semibold text-gray-900">
          {t("settings.shippingForm.flatRate")} <span className="text-red-500">*</span>
        </label>
        <div
          className={`mt-2 flex items-center overflow-hidden rounded-xl border ${errors.flatRate ? "border-red-400" : "border-gray-200"
            } focus-within:border-gray-400`}
        >
          <span className="border-r border-gray-200 bg-gray-50 px-3 py-2.5 text-sm text-gray-500">
            {currency}
          </span>
          <input
            id="flatRate"
            type="number"
            step="0.01"
            min="0"
            disabled={isPending}
            placeholder="0.00"
            {...register("flatRate", {
              required: true,
              valueAsNumber: true,
              min: 0,
            })}
            className="w-full px-3 py-2.5 text-sm placeholder:text-gray-400 focus:outline-none disabled:bg-gray-100"
          />
        </div>
        <p className="mt-1.5 text-xs text-gray-400">
          {t("settings.shippingForm.flatRateHint")}
        </p>
      </div>

      {/* Regional shipping */}
      {regions.length > 0 && (
        <div className="mt-3 md:mt-6">
          <p className="text-sm font-semibold text-gray-900">
            {t("settings.shippingForm.regionalShipping")}
          </p>
          <div className="mt-2 overflow-hidden rounded-xl border border-gray-200">
            {regions.map((region, i) => (
              <div
                key={region.id}
                className={`flex items-center justify-between px-4 py-2.5 ${i % 2 === 1 ? "bg-gray-50" : "bg-white"
                  } ${i !== 0 ? "border-t border-gray-100" : ""}`}
              >
                <span className="text-sm text-gray-700">
                  {t(`settings.shippingForm.regions.${region.id}`, { defaultValue: region.label })}
                </span>
                <div className="flex items-center overflow-hidden rounded-lg border border-gray-200 bg-white">
                  <span className="border-r border-gray-200 px-2 py-1.5 text-xs text-gray-400">
                    {currency}
                  </span>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    disabled={isPending}
                    placeholder="0.00"
                    {...register(`regionalRates.${region.id}` as const, {
                      valueAsNumber: true,
                      min: 0,
                    })}
                    className="w-20 px-2 py-1.5 text-right text-xs placeholder:text-gray-300 focus:outline-none disabled:bg-gray-100"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Info banner */}
      <div className="mt-3 md:mt-6 flex gap-2.5 rounded-xl border border-indigo-200 bg-indigo-50 p-3.5">
        <Info size={16} className="mt-0.5 shrink-0 text-indigo-500" />
        <p className="text-sm text-indigo-700">
          {t("settings.shippingForm.infoBanner")}
        </p>
      </div>

      {/* Actions */}
      <div className="mt-3 md:mt-6 flex justify-end gap-3">
        <button
          type="button"
          onClick={handleReset}
          disabled={isPending}
          className="flex items-center gap-1.5 rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer disabled:opacity-50"
        >
          <RotateCcw size={15} />
          {t("settings.shippingForm.reset", { defaultValue: "Reset" })}
        </button>

        <button
          type="submit"
          disabled={!isValid || isPending}
          className={`rounded-xl px-5 py-2.5 text-sm font-semibold transition-colors cursor-pointer ${isValid && !isPending
            ? "bg-gray-900 text-white hover:bg-gray-800"
            : "cursor-not-allowed bg-gray-100 text-gray-400"
            }`}
        >
          {isPending ? t("settings.shippingForm.saving") : t("settings.shippingForm.save")}
        </button>
      </div>
    </form>
  );
}