"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import AppBreadcrumb from "@/components/widgets/AppBreadcrumb";
import { useRouter } from "@/i18n/navigation";
import { useGetBranches } from "@/services/queries";
import { BranchesData } from "@/types/interface";
import {
  Clusterer,
  Map,
  Placemark,
  Polygon,
  YMaps,
} from "@pbe/react-yandex-maps";
import { Minus, Plus, Search } from "lucide-react";
import { useTranslations } from "next-intl";
import { useRef, useState } from "react";
import ModalBranchMap from "./_components/ModalBranchMap";

const BranchesPage = () => {
  const t = useTranslations();
  const [value, setValue] = useState("");
  const route = useRouter();
  const mapRef = useRef<any>(null);
  const { data } = useGetBranches();
  const [branchData, setBranchData] = useState<BranchesData | null>(null);
  const [openModal, setOpenModal] = useState(false);
  return (
    <div>
      <AppBreadcrumb
        items={[
          {
            label: "Branches.title",
            isCurrent: true,
          },
        ]}
      />
      <div className="flex items-center">
        <h1 className="text-2xl font-semibold">{t("Branches.titlePage")}</h1>
        <Button
          variant={"link"}
          className="text-blue-500 underline font-normal hidden max-[900px]:block"
          onClick={() => setOpenModal(!openModal)}
        >
          {t("Branches.viewFromMap")}
        </Button>
      </div>
      <div className="flex gap-2 h-[700px] bg-white p-4 rounded-lg mt-5">
        <div className="h-full w-1/2 flex flex-col max-[900px]:w-full">
          <div className="relative">
            <Search className="absolute top-1/2 -translate-y-1/2 size-5 text-muted-foreground left-2.5" />
            <Input
              value={value}
              onChange={(e) => setValue(e.target.value)}
              className="focus-visible:ring-0 focus-visible:border-gray-400 transition-all duration-200 pl-10"
              placeholder={t("Header.mapTakeAway.inputPlaceholder")}
            />
          </div>

          <div className="flex-1 my-5 relative">
            <div className="overflow-y-scroll flex flex-col gap-4 absolute w-full h-full">
              {data?.data
                .filter((item) =>
                  value
                    ? item.name.toLowerCase().includes(value.toLowerCase())
                    : item
                )
                .map((item) => (
                  <div
                    key={item.id}
                    onClick={() => {
                      setBranchData(item);
                      mapRef.current?.setCenter(
                        [parseFloat(item.lat), parseFloat(item.long)],
                        15,
                        { duration: 300 }
                      );
                    }}
                    className={`w-full bg-secondary p-3 flex flex-col gap-1 rounded-2xl cursor-pointer border border-secondary ${
                      item.id === branchData?.id && "!border-ring"
                    } duration-200`}
                  >
                    <h1 className="flex items-center gap-2 font-semibold text-xl">
                      {item.name}
                    </h1>
                    <span className="text-sm">{item.name}</span>
                    <div className="text-base text-muted-foreground">
                      {t("Branches.card.filialTime")}:{" "}
                      <span className="text-sm text-black">
                        {item.work_time_start.slice(0, 5)} -{" "}
                        {item.work_time_end.slice(0, 5)}
                      </span>
                    </div>
                    <div className="text-base text-muted-foreground mt-0.5">
                      {t("Branches.card.deliveryTable")}:{" "}
                      <span className="text-sm text-black">
                        {item.work_time_start.slice(0, 5)} -{" "}
                        {item.work_time_end.slice(0, 5)}
                      </span>
                    </div>
                    <div className="text-base text-muted-foreground mt-0.5">
                      {t("Profile.phone")}:{" "}
                      <span className="text-sm text-black">+998939987055</span>
                    </div>
                    <div className="grid grid-cols-2 gap-3 mt-2 max-[700px]:grid-cols-1">
                      <Button
                        className="py-5"
                        onClick={(e) => {
                          e.stopPropagation();
                          window.open(
                            `https://yandex.com/maps/?ll=${item.long},${item.lat}&z=16&pt=${item.long},${item.lat},pm2rdm`,
                            "_blank"
                          );
                        }}
                      >
                        {t("Branches.card.buttons.buildRoute")}
                      </Button>
                      <Button
                        variant={"outline"}
                        className="!bg-transparent hover:!bg-transparent border-ring text-ring py-5"
                        onClick={(e) => {
                          e.stopPropagation();
                          route.push(`/branches/${item.id}`);
                        }}
                      >
                        {t("Branches.card.buttons.detail")}
                      </Button>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
        <div className="h-full w-1/2 flex flex-col max-[900px]:hidden">
          <div className="w-full flex-1 rounded-xl overflow-hidden relative">
            <div className="absolute w-full h-full">
              <div className="absolute right-3 top-7 z-10">
                <div className="flex flex-col mt-5">
                  <Button
                    className="bg-white hover:bg-white rounded-t-full w-9 h-12 shadow-2xl border-b"
                    variant={"secondary"}
                    onClick={() => {
                      mapRef.current?.setZoom(mapRef.current?.getZoom() + 1);
                    }}
                  >
                    <Plus className="size-4 !text-black" />
                  </Button>
                  <Button
                    className="bg-white hover:bg-white rounded-b-full w-9 h-12 shadow-2xl"
                    variant={"secondary"}
                    onClick={() => {
                      if (mapRef.current?.getZoom() === 1) {
                        return;
                      }
                      mapRef.current?.setZoom(mapRef.current?.getZoom() - 1);
                    }}
                  >
                    <Minus className="size-4 !text-black" />
                  </Button>
                </div>
              </div>
              <div style={{ width: "100%", height: "100%" }}>
                <YMaps
                  query={{
                    apikey: "1fefb563-821c-4a64-90d3-1db6133f51c8",
                    load: "geocode",
                    lang: "ru_RU",
                  }}
                >
                  <Map
                    instanceRef={(ref) => (mapRef.current = ref)}
                    defaultState={{
                      center: [40.36464, 65.61523],
                      zoom: 10,
                    }}
                    width="100%"
                    height="100%"
                  >
                    <Polygon
                      geometry={data?.data.map((item) =>
                        item.service_areas.flat()
                      )}
                      options={{
                        fillColor: "#f5f900a3",
                        strokeColor: "#f5f900a3",
                        opacity: 0.5,
                        strokeWidth: 1,
                        strokeStyle: "shortdash",
                      }}
                    />
                    <Clusterer
                      options={{
                        preset: "islands#invertedVioletClusterIcons",
                        groupByCoordinates: false,
                      }}
                    >
                      {data?.data.map((item) => (
                        <Placemark
                          key={item.id}
                          geometry={[
                            parseFloat(item.lat),
                            parseFloat(item.long),
                          ]}
                          properties={{
                            balloonContent: item.name,
                            hintContent: item.name,
                          }}
                          options={{
                            preset: item.is_active
                              ? "islands#greenDotIcon"
                              : "islands#grayDotIcon",
                          }}
                          instanceRef={(ref) => {
                            if (ref) {
                              ref.events.add("click", () => {
                                mapRef.current?.setCenter(
                                  [parseFloat(item.lat), parseFloat(item.long)],
                                  15,
                                  { duration: 300 }
                                );

                                // 🔎 setBranchData chaqirish
                                setBranchData(item);
                              });
                            }
                          }}
                        />
                      ))}
                    </Clusterer>
                  </Map>
                </YMaps>
              </div>
            </div>
          </div>
        </div>
      </div>

      <ModalBranchMap
        branches={data?.data ?? []}
        open={openModal}
        setOpen={setOpenModal}
        branchData={branchData}
        setBranchData={setBranchData}
      />
    </div>
  );
};

export default BranchesPage;
