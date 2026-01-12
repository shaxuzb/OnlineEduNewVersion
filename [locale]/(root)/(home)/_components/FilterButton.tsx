"use client";
// import { Button } from "@/components/ui/button";
// import { Checkbox } from "@/components/ui/checkbox";
// import { Label } from "@/components/ui/label";
// import FilterImage from "@/assets/images/filterImage.webp";
// import {
//   Popover,
//   PopoverContent,
//   PopoverTrigger,
// } from "@/components/ui/popover";
// import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
// import { Filter } from "lucide-react";
// import { useEffect, useRef, useState } from "react";
// import Image from "next/image";
import { useGetCategory } from "@/services/queries";
import { getLocalized } from "@/utils/utils";
import { useLocale } from "next-intl";
// const sortOptions: { id: number; value: string; label: string }[] = [
//   { id: 1, value: "a-z", label: "A dan Ya gacha" },
//   { id: 2, value: "rating", label: "Mijozlarning bahosiga ko‘ra" },
//   { id: 3, value: "low-to-high", label: "Avval arzonroq" },
//   { id: 4, value: "high-to-low", label: "Avval qimmatroq" },
// ];
// const filterOptions: { id: string; label: string }[] = [
//   { id: "bestseller", label: "Sotuv hitlari" },
//   { id: "new", label: "Yangilik" },
//   { id: "chicken", label: "Tovuq" },
//   { id: "cheese", label: "Pishloq" },
//   { id: "spicy", label: "Achchiq" },
// ];
const FilterButton = () => {
  // const [filterOpen, setFilterOpen] = useState<boolean>(false);
  // const filterRef = useRef(null);
  const locale = useLocale();
  const { data } = useGetCategory();

  // useEffect(() => {
  //   if (filterOpen) {
  //     if (filterRef.current) {
  //       (filterRef.current as any).scrollIntoView({
  //         behavior: "smooth",
  //         block: "start",
  //       });
  //     }
  //   }
  // }, [filterOpen]);
  return (
    <div className=" my-4">
      <div
        data-card-name={"filter"}
        className="flex gap-3 flex-wrap max-[800px]:hidden"
      >
        {/* <Popover open={filterOpen} onOpenChange={setFilterOpen}>
          <PopoverTrigger asChild>
            <div
              ref={filterRef}
              onClick={() => {
                setFilterOpen(true);
              }}
              className="bg-white py-2 px-4 rounded-full flex gap-2 items-center cursor-pointer scroll-mt-20"
            >
              <Filter className="size-4" />
              Filter
            </div>
          </PopoverTrigger>

          <PopoverContent
            align="start"
            side="bottom"
            avoidCollisions={false}
            className="px-1 py-2"
          >
            <div>
              <div className="flex justify-between items-center px-2">
                <span className="text-muted-foreground">Filter</span>
                <Button variant={"link"} className="p-0 cursor-pointer">
                  Tozalash
                </Button>
              </div>
              <div className="mt-3">
                <RadioGroup
                  defaultValue="option-one"
                  className="w-full flex flex-col gap-2"
                >
                  {sortOptions.map((item) => (
                    <div key={item.id} className="w-full">
                      <Label
                        htmlFor={item.value}
                        className="flex w-full justify-between items-center cursor-pointer px-2 py-3 hover:bg-secondary duration-150 rounded-md"
                      >
                        {item.label}
                        <RadioGroupItem value={item.value} id={item.value} />
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>
              <div className="flex justify-between items-center px-2 mt-3">
                <span className="text-muted-foreground">Teglar</span>
              </div>
              <div className="mt-3">
                <div className="flex flex-col space-y-2">
                  {filterOptions.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between"
                    >
                      <Label
                        htmlFor={item.id}
                        className="flex w-full justify-between items-center cursor-pointer px-2 py-3 hover:bg-secondary duration-150 rounded-md "
                      >
                        <span className="flex  items-center gap-2">
                          <Image
                            width={30}
                            src={FilterImage}
                            alt="FilterButton"
                          />
                          {item.label}
                        </span>
                        <Checkbox id={item.id} />
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
              <Button
                className="w-full cursor-pointer mt-2"
                onClick={() => setFilterOpen(false)}
              >
                Filter
              </Button>
            </div>
          </PopoverContent>
        </Popover> */}
        {data?.data.map((item) => {
          const sectionId = item.name_en.split(" ").join("_").toLowerCase();
          return (
            <a key={item.id} href={"#"+sectionId}>
              <div
                key={item.id}
                className="bg-white py-2 px-4 rounded-full text-nowrap"
              >
                {getLocalized(item, "name", locale)}
              </div>
            </a>
          );
        })}
      </div>
      <div className="gap-3 overflow-x-scroll scrollbar-hide hidden max-[800px]:flex">
        {data?.data.map((item) => {
          const sectionId = item.name_en.split(" ").join("_").toLowerCase();
          return (
            <a key={item.id} href={"#"+sectionId}>
              <div
                key={item.id}
                className="bg-white py-2 px-4 rounded-full text-nowrap"
              >
                {getLocalized(item, "name", locale)}
              </div>
            </a>
          );
        })}
      </div>
    </div>
  );
};

export default FilterButton;
