import Checkouts from "./_components/Checkouts";
import { getAddressInfo, getUserInfo } from "@/services/queries";
import { userKeys } from "@/constants/queryKeys";
import { addressEndpoints } from "@/constants/enpoints";
import getQueryClient from "@/utils/helpers/getQueryClient";

const Checkout = async () => {
  const queryClient = getQueryClient();
  await Promise.all([
    queryClient.prefetchQuery({
      queryKey: [userKeys.getUserInfo],
      queryFn: getUserInfo,
    }),
    queryClient.prefetchQuery({
      queryKey: [addressEndpoints.addressInfo],
      queryFn: getAddressInfo,
    }),
  ]);

  return (
    <div>
      <Checkouts />
    </div>
  );
};

export default Checkout;
