"use client";

import { config } from "@/config";
import { useGetServiceDetail } from "@/services/queries";
import { Render } from "@measured/puck";
import { useParams } from "next/navigation";
import "@measured/puck/puck.css";
import AppBreadcrumb from "@/components/widgets/AppBreadcrumb";
import { getLocalized } from "@/utils/utils";
import { useLocale } from "next-intl";

const ServiceDetail = () => {
  const params = useParams();
  const { data, isLoading, isFetching } = useGetServiceDetail(
    Number(params.serviceId)
  );
  const locale = useLocale();
  if (isLoading || isFetching) {
    return (
      <div className="flex w-full h-screen justify-center items-center">
        <span className="loader !border-ring !border-b-transparent !size-20"></span>
      </div>
    );
  }
  if (!(data && data.data)) {
    return <div></div>;
  }

  const content = data.data?.puck_data.content;

  if (!content) {
    return <div>Config yoki content yo‘q</div>;
  }

  // server config + local render funksiyalarni birlashtiramiz

  return (
    <div className="w-full flex flex-col justify-center ">
      <AppBreadcrumb
        items={[
          {
            label: "Service.title",
            isCurrent: false,
          },
          {
            label: getLocalized(data.data, "name", locale),
            isCurrent: true,
            customText: true,
          },
        ]}
      />
      <Render config={config} data={{ content: content.content }} />
    </div>
  );
};

export default ServiceDetail;
