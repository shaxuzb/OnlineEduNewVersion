import React from "react";
import { addressKeys } from "@/constants/queryKeys";
import { getBranches } from "@/services/queries";
import getQueryClient from "@/utils/helpers/getQueryClient";

export default async function BranchLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const queryClient = getQueryClient();
  await queryClient.prefetchQuery({
    queryKey: [addressKeys.branches],
    queryFn: getBranches,
  });
  return <div className="my-7">{children}</div>;
}
