import UserDataCard from "./_components/UserDataCard";
import UserAddress from "./_components/UserAddress";
import { getAddressInfo, getUserInfo } from "@/services/queries";
import { userKeys } from "@/constants/queryKeys";
import { addressEndpoints } from "@/constants/enpoints";
import TokenSync from "../../TokenSync";
import getQueryClient from "@/utils/helpers/getQueryClient";

export default async function Profile() {
  const queryClient = getQueryClient();
  await Promise.all([
    await queryClient.prefetchQuery({
      queryKey: [userKeys.getUserInfo],
      queryFn: getUserInfo,
    }),
    await queryClient.prefetchQuery({
      queryKey: [addressEndpoints.addressInfo],
      queryFn: getAddressInfo,
    }),
  ]);
  return (
    <div>
      <TokenSync />
      <div className="mb-10">
        <h1 className="text-4xl font-bold mt-10">Profil</h1>
        <UserDataCard />
        <UserAddress />
      </div>
    </div>
  );
}
