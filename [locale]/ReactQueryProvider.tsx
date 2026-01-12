"use client";

import { useAppSelector } from "@/store/hooks";
import { queryClient } from "@/utils/helpers/queryClient";
import { askNotificationPermission } from "@/utils/pushNotification";
import {
  QueryClientProvider,
  HydrationBoundary,
  dehydrate,
} from "@tanstack/react-query";
import { useEffect } from "react";

const ReactQueryProvider = ({
  children,
}: {
  children: React.ReactNode;
  dehydratedState?: any;
}) => {
  const user = useAppSelector((state) => state.auth.user);
  useEffect(() => {
    if (!!user) {
      askNotificationPermission();
    }
  }, [user]);
  return (
    <QueryClientProvider client={queryClient}>
      <HydrationBoundary state={dehydrate(queryClient)}>
        {children}
      </HydrationBoundary>
    </QueryClientProvider>
  );
};

export default ReactQueryProvider;
