import type { ShippingProvider } from "./provider.interface";
import { manualShippingProvider } from "./providers/manual.provider";

// Register real couriers (Aramex, etc.) here as they're integrated.
const providers: Record<string, ShippingProvider> = {
  manual: manualShippingProvider,
};

export function getShippingProvider(name: string = "manual"): ShippingProvider {
  const provider = providers[name];
  if (!provider) {
    throw new Error(`Unknown shipping provider: ${name}`);
  }
  return provider;
}
