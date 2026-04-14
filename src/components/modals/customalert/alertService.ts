export type AlertType = "default" | "error" | "warning" | "success";

export interface AlertConfig {
  type?: AlertType;
  title?: string;
  description?: string;
  cancelText?: string;
  okText?: string;
  showCancel?: boolean;
  onOk?: () => void;
  onCancel?: () => void;
  iconName?: string;
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
