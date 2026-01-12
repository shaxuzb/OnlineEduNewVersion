"use client";
import Image from "next/image";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination, Autoplay } from "swiper/modules";
import "swiper/css/pagination";
import "swiper/css/autoplay";
import { useGetBanners } from "@/services/queries";
import { useRouter } from "@/i18n/navigation";

const Banner = () => {
  const { data } = useGetBanners();
  const router = useRouter();
  const handleNavigate = (link: string | null) => {
    if (!link) {
      return;
    }
    router.push(link);
  };
  return (
    <div>
      <Swiper
        spaceBetween={0}
        slidesPerView={1}
        autoplay={{
          delay: 3000,
        }}
        modules={[Pagination, Autoplay]}
        pagination={{
          clickable: true,
        }}
        loop={true}
        className="rounded-xl overflow-hidden aspect-[3/1]"
      >
        {data?.data.map((item) => (
          <SwiperSlide
            className="cursor-pointer"
            onClick={() => handleNavigate(item.link)}
          >
            <Image
              src={`${item.images?.banner}`}
              alt={item.title}
              width={1920}
              height={500}
              className="object-cover"
            />
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
};

export default Banner;
