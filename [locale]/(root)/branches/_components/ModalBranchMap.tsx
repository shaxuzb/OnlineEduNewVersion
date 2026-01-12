import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogOverlay,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import useWindowSize from "@/hooks/useWindowSize";
import { useRouter } from "@/i18n/navigation";
import { BranchesData } from "@/types/interface";
import { Clusterer, Map, Placemark, YMaps } from "@pbe/react-yandex-maps";
import {
  ArrowLeft,
  ChevronDown,
  ChevronUp,
  LocateIcon,
  Minus,
  Plus,
  Search,
} from "lucide-react";
import { useTranslations } from "next-intl";
import React, { FC, SetStateAction, useEffect, useRef, useState } from "react";
interface ModalBranchMapProps {
  branchData: BranchesData | null;
  branches: BranchesData[];
  setBranchData: React.Dispatch<SetStateAction<BranchesData | null>>;
  open: boolean;
  setOpen: React.Dispatch<SetStateAction<boolean>>;
}
const ModalBranchMap: FC<ModalBranchMapProps> = (props) => {
  const { branches, branchData, setBranchData, open, setOpen } = props;
  const { width } = useWindowSize();
  const [poverSearch, setPopoverSearch] = useState(false);
  const [value, setValue] = useState<string>("");
  const route = useRouter();
  const t = useTranslations();
  const mapRef = useRef<any>(null);
  return (
    <Dialog
      open={open && width < 900}
      onOpenChange={(e) => {
        setOpen(e);
      }}
    >
      <DialogOverlay className="backdrop-blur-sm  !bg-transparent" />
      <DialogContent
        className="w-full !max-w-full h-full rounded-none p-2"
        showCloseButton={false}
      >
        <DialogHeader className="hidden">
          <DialogTitle></DialogTitle>
        </DialogHeader>
        <div className="h-full w-full flex flex-col">
          <div className="flex items-center gap-2 mt-2 mb-3">
            <Button
              variant={"ghost"}
              className="py-6 w-12"
              onClick={() => setOpen(false)}
            >
              <ArrowLeft className="size-6" />
            </Button>
            <div className="relative w-full">
              <Search className="absolute top-1/2 -translate-y-1/2 size-5 text-muted-foreground left-3" />
              <Input
                className="focus-visible:ring-0 focus-visible:border-gray-400 transition-all duration-200 pl-10 py-5.5"
                placeholder={t("Header.mapTakeAway.inputPlaceholder")}
                value={value}
                onChange={(e) => {
                  setValue(e.target.value);
                  setPopoverSearch(true);
                }}
              />
              <Button
                className="absolute top-1/2 -translate-y-1/2 !w-8 !h-8 size-5 text-muted-foreground right-3"
                variant={"ghost"}
                onClick={() => setPopoverSearch(!poverSearch)}
              >
                {poverSearch ? <ChevronUp /> : <ChevronDown />}
              </Button>
              {poverSearch && (
                <div className="absolute z-20 bg-white shadow-search-popver w-full rounded-sm max-h-56 top-[calc(100%_+_10px)] overflow-y-auto p-2 scrollbar-hide">
                  {branches &&
                  branches.filter((item) =>
                    value
                      ? item.name.toLocaleLowerCase() ===
                        value.toLocaleLowerCase()
                      : item.name
                  ).length > 0 ? (
                    <div className="flex flex-col">
                      {branches
                        .filter((item) =>
                          value
                            ? item.name
                                .toLocaleLowerCase()
                                .includes(value.toLocaleLowerCase())
                            : item.name
                        )
                        .map((item) => (
                          <div
                            key={item.id}
                            className="flex gap-3 items-center cursor-pointer duration-100 hover:bg-secondary p-2 rounded-lg"
                            onClick={() => {
                              setBranchData(item);
                              mapRef.current?.setCenter(
                                [parseFloat(item.lat), parseFloat(item.long)],
                                15,
                                { duration: 300 }
                              );
                              setPopoverSearch(false);
                            }}
                          >
                            <div className="flex gap-2 items-center">
                              <LocateIcon className="size-4 mt-1" />
                              <div>
                                <h1 className="flex items-center gap-2 font-bold text-sm">
                                  {item?.name}
                                </h1>
                                <span className="text-sm text-muted-foreground">
                                  {item?.name}
                                </span>
                              </div>
                            </div>
                          </div>
                        ))}
                    </div>
                  ) : (
                    "Topilmadi"
                  )}
                </div>
              )}
            </div>
          </div>
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
                    <Clusterer
                      options={{
                        preset: "islands#invertedVioletClusterIcons",
                        groupByCoordinates: false,
                      }}
                    >
                      {branches?.map((item) => (
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
          <div className="block mt-4">
            {branchData && (
              <div className="hidden max-[900px]:block px-2 mb-3">
                <div className="w-full bg-secondary p-3 flex-col gap-1 rounded-2xl cursor-pointer border border-secondary duration-200">
                  <div className="flex gap-2">
                    <LocateIcon className="size-4 mt-1" />
                    <div>
                      <h1 className="flex items-center gap-2 font-bold text-sm">
                        {branchData?.name}
                      </h1>
                      <span className="text-sm text-muted-foreground">
                        {branchData?.name}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}
            <div className="max-[900px]:px-2 max-[900px]:pb-5">
              <Button
                disabled={!branchData}
                onClick={(e) => {
                  e.stopPropagation();
                  route.push(`/branches/${branchData?.id}`);
                }}
                className="w-full text-white h-11"
              >
                {t("Buttons.save")}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ModalBranchMap;
