export interface UpdatePresentationInput {
  updateAvailable: boolean;
  forceUpdate: boolean;
  storeVersion: string;
  dismissedVersion: string | null;
}

export const shouldPresentUpdate = ({
  updateAvailable,
  forceUpdate,
  storeVersion,
  dismissedVersion,
}: UpdatePresentationInput): boolean => {
  if (!updateAvailable) return false;
  if (forceUpdate) return true;
  return dismissedVersion !== storeVersion;
};

export const validateStoreUrl = (
  platform: "ios" | "android" | string,
  value: string,
): string | null => {
  try {
    const url = new URL(value);
    if (url.protocol !== "https:") return null;

    if (platform === "ios") {
      return url.hostname === "apps.apple.com" ? url.toString() : null;
    }

    if (platform === "android") {
      return url.hostname === "play.google.com" ? url.toString() : null;
    }

    return null;
  } catch {
    return null;
  }
};
