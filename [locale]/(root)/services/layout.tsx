import React from "react";
import { serviceKeys } from "@/constants/queryKeys";
import { getServices } from "@/services/queries";
import getQueryClient from "@/utils/helpers/getQueryClient";

export default async function ServiceLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
const queryClient = getQueryClient();
  await queryClient.prefetchQuery({
    queryKey: [serviceKeys.getDetail],
    queryFn: getServices,
  });
  return (
      <div className="my-7">{children}</div>
  );
}
