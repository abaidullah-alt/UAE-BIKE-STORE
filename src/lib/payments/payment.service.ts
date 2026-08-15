import type { PaymentProvider } from "./provider.interface";
import { codProvider } from "./providers/cod.provider";

// As real UAE gateways are integrated (Telr, Network International, Stripe),
// register them here and select via env var. Nothing outside this file
// needs to know which provider is active.
const providers: Record<string, PaymentProvider> = {
  cod: codProvider,
};

export function getPaymentProvider(name: string): PaymentProvider {
  const provider = providers[name];
  if (!provider) {
    throw new Error(`Unknown payment provider: ${name}. Available: ${Object.keys(providers).join(", ")}`);
  }
  return provider;
}
