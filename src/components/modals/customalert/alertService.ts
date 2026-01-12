export interface AlertConfig {
  title: string;
  description?: string;
  cancelText?: string;
  okText?: string;
  onOk?: () => void;
  onCancel?: () => void;
}

type Listener = (config: AlertConfig | null) => void;

let listener: Listener | null = null;

export const alertService = {
  subscribe(fn: Listener) {
    listener = fn;
  },
  unsubscribe() {
    listener = null;
  },
  open(config: AlertConfig) {
    listener?.(config);
  },
  close() {
    listener?.(null);
  },
};
