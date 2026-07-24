import ShippingSettingsForm, {
  type ShippingSettingsValues,
} from '../Shippingsettingsform';
import {
  useVendorShipping,
  useUpdateVendorShipping,
} from '../hooks/useVendorShipping';
import { useCooldown } from '../../../hooks/useCooldown';
import { ShippingSettingsFormSkeleton } from '../skeleton/SettingsSkeletons';

export function ShippingTab() {
  const {
    shippingValues,
    regions,
    isConfigured,
    isLoading,
  } = useVendorShipping();
  const updateShippingMutation = useUpdateVendorShipping();
  const { active: cooldown, trigger: triggerCooldown } = useCooldown(3000);

  const handleSave = (values: ShippingSettingsValues) => {
    updateShippingMutation.mutate(values, {
      onSettled: () => triggerCooldown(),
    });
  };

  if (isLoading) {
    return <ShippingSettingsFormSkeleton />;
  }

  return (
    <ShippingSettingsForm
      regions={regions}
      defaultValues={shippingValues}
      isConfigured={isConfigured}
      isPending={updateShippingMutation.isPending || cooldown}
      onSave={handleSave}
    />
  );
}
