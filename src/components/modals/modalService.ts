type Listener = (config: boolean) => void;

let listener: Listener | null = null;

export const modalService = {
  subscribe(fn: Listener) {
    listener = fn;
  },
  unsubscribe() {
    listener = null;
  },
  open() {
    listener?.(true);
  },
  close() {
    listener?.(false);
  },
};
