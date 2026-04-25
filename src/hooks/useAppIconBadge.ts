import * as Notifications from "expo-notifications";
import { useEffect, useRef } from "react";
import { Platform } from "react-native";

export function useAppIconBadge(count: number) {
  const lastAppliedCountRef = useRef<number | null>(null);
  const badgePermissionCheckedRef = useRef(false);

  useEffect(() => {
    const nextCount = Math.max(0, Number.isFinite(count) ? count : 0);
    if (lastAppliedCountRef.current === nextCount) {
      return;
    }

    const applyBadge = async () => {
      try {
        if (Platform.OS === "ios" && !badgePermissionCheckedRef.current) {
          badgePermissionCheckedRef.current = true;
          const currentPermissions = await Notifications.getPermissionsAsync();
          const hasBadgePermission =
            currentPermissions.granted || !!currentPermissions.ios?.allowsBadge;

          if (!hasBadgePermission) {
            const requestedPermissions =
              await Notifications.requestPermissionsAsync({
                ios: {
                  allowAlert: false,
                  allowSound: false,
                  allowBadge: true,
                },
              });

            const grantedAfterRequest =
              requestedPermissions.granted ||
              !!requestedPermissions.ios?.allowsBadge;

            if (!grantedAfterRequest) {
              return;
            }
          }
        }

        const applied = await Notifications.setBadgeCountAsync(nextCount);
        if (applied) {
          lastAppliedCountRef.current = nextCount;
        }
      } catch (error) {
        console.warn("Failed to set app icon badge count:", error);
      }
    };

    applyBadge();
  }, [count]);
}

