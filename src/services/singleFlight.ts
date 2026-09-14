export const createSingleFlight = <T>() => {
  const inFlight = new Map<string, Promise<T>>();

  return (key: string, request: () => Promise<T>): Promise<T> => {
    const existing = inFlight.get(key);
    if (existing) return existing;

    const promise = request().finally(() => {
      if (inFlight.get(key) === promise) {
        inFlight.delete(key);
      }
    });
    inFlight.set(key, promise);
    return promise;
  };
};
