import React from "react";
import { siteInfoKeys } from "@/constants/queryKeys";
import { getSiteInfo } from "@/services/queries";
import getQueryClient from "@/utils/helpers/getQueryClient";

export default async function ContactsLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const queryClient = getQueryClient();
  await queryClient.prefetchQuery({
    queryKey: [siteInfoKeys.getDetail],
    queryFn: getSiteInfo,
  });
  return <div className="my-7">{children}</div>;
}
