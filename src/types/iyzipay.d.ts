declare module "iyzipay" {
  type Callback = (error: Error | null, result: Record<string, unknown>) => void;
  type Resource = {
    initialize(request: Record<string, unknown>, callback: Callback): void;
    retrieve(request: Record<string, unknown>, callback: Callback): void;
    cancel(request: Record<string, unknown>, callback: Callback): void;
    search(request: Record<string, unknown>, callback: Callback): void;
  };
  export default class Iyzipay {
    static LOCALE: { TR: string; EN: string };
    static SUBSCRIPTION_INITIAL_STATUS: { ACTIVE: string; PENDING: string };
    constructor(config: { uri: string; apiKey: string; secretKey: string });
    subscriptionCheckoutForm: Resource;
    subscription: Resource;
  }
}
