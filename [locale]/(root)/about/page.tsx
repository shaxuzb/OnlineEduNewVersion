"use client";

import AppBreadcrumb from "@/components/widgets/AppBreadcrumb";
import Logo from "@/lib/cutomIcons";
import Image from "next/image";
import ImageAbout1 from "@/assets/images/about1.png";
import ImageAbout2 from "@/assets/images/about2.png";
import { Swiper, SwiperSlide } from "swiper/react";
import useWindowSize from "@/hooks/useWindowSize";
const images = [ImageAbout1, ImageAbout2, ImageAbout2];
const AboutPage = () => {
  const { width } = useWindowSize();
  const MIN_SLIDES_FOR_LOOP = 4;
  let slides = images;
  if (images.length > 0 && images.length < MIN_SLIDES_FOR_LOOP) {
    const times = Math.ceil(MIN_SLIDES_FOR_LOOP / images.length);
    slides = Array.from({ length: times }).flatMap(() => images);
  }
  return (
    <div className="my-7">
      <AppBreadcrumb
        items={[
          {
            label: "Home.title",
            isCurrent: true,
          },
        ]}
      />
      <div>
        <div
          data-item="header"
          className="flex justify-center flex-col items-center"
        >
          <div className="scale-150">
            <Logo />
          </div>
          <h1 className="text-4xl font-bold mt-4 max-[780px]:text-xl">
            To'g'ri tayyorgarlik, to'g'ri tanlov
          </h1>
        </div>
        <div className="mt-10">
          <Swiper
            slidesPerView={width < 800 ? 1.3 : 3}
            centeredSlides={true}
            spaceBetween={width < 800 ? 20 : 30}
            loop={true}
            watchOverflow={true}
            observer={true}
            observeParents={true}
            className="mySwiper relative"
          >
            {slides.map((src, idx) => (
              <SwiperSlide
                key={`slide-${idx}`}
                className="bg-gray-500 rounded-lg overflow-hidden !h-[400px] max-[800px]:!h-[330px]"
              >
                <Image
                  src={src}
                  className="object-cover w-full h-full"
                  alt="sdad"
                />
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
        <div className="flex gap-6 flex-col max-w-[700px] mt-10 mx-auto">
          <p className="max-[750px]:text-sm">
            Baxt Restoran-ning birinchi joyi 2009 yilda ochildi. Dastlabki bosqichda
            top pozitsiyalarga burgarlar, donerlar va lavashlar kirardi. Bugungi
            kunda bu taniqli va dinamik rivojlanayotgan brend bo'lib, Sarmarqanddagi 
            katta rostoranlar qatoridan joy olgan.
          </p>
          <p className="max-[750px]:text-sm">
            Baxt Restoran faqatgina halal mahsulotlardan foydalanadi. Asosiy menyuga
            qo'shimcha sifatida yog' miqdori kam bo'lgan mualliflik souslari
            liniyasi mavjud. Tarmoq oshpazlari ishlatiladigan mahsulotlarning
            sifatiga alohida e'tibor qaratadi. Baxt Restoran'da ular faqatgina yangi,
            ISO standartlariga muvofiq saqlanadi.
          </p>
          <p className="max-[750px]:text-sm">
            Taomlar nafaqat mazali, balki oson hazm bo'ladigan, tezkor
            taomlanish uchun ham, to'liq ovqat sifatida ham mos keladi. Baxt Restoran
            tarmog'ining har bir filialida noaniq va qulay muhit mavjud, va
            tarmoqning do'stona jamoasi uzluksiz va to'siqsiz ishlaydi. Kun
            davomida tarmoq restoranlarida turli xil mehmonlarni uchratish
            mumkin: maktab o'quvchilari, talabalar, va ish soatidan keyin yaxshi
            ovqatlanishni istagan biznesmenlar.
          </p>
        </div>
        <div className="mt-10">
          <div className="flex flex-col gap-5">
            <h1 className="text-5xl font-bold max-[750px]:text-2xl">
              Bizning raqamlar siz uchun
            </h1>
            <p className="max-[750px]:text-sm">
              Biz mehmonlarimizga bizda mavjud bo'lgan hamma narsani sizning
              yordamingiz bilan amalga oshirish imkoniyatini berganingiz uchun
              chuqur minnatdorchilik bildiramiz. Sizning qo'llab-quvvatlashingiz
              va sadoqatingiz bizni har kuni o‘sishga va rivojlanishga
              ilhomlantiradi. Bizni yaxshilayotganingiz uchun rahmat!
            </p>
          </div>
          {/* <div className="flex gap-10 mt-10 items-center">
            <div className="min-w-72 h-96 rounded-lg overflow-hidden max-[880px]:hidden">
              <Image
                src={ImageAbout}
                alt="20pxxasd"
                className="object-cover w-full h-full"
              />
            </div>
            <div className="grid grid-cols-2 gap-3 gap-y-24 h-fit grow">
              <div className="">
                <h1 className="text-7xl flex gap-2 font-bold max-[650px]:text-4xl">
                  20<span className="text-ring">+</span>
                </h1>
                <p className="text-lg text-muted-foreground max-[650px]:text-sm">
                  Filiallar
                </p>
              </div>
              <div className="">
                <h1 className="text-7xl flex gap-2 font-bold max-[650px]:text-4xl">
                  30<span className="text-ring">+</span>
                </h1>
                <p className="text-lg text-muted-foreground max-[650px]:text-sm">
                  voqealar
                </p>
              </div>
              <div className="">
                <h1 className="text-7xl flex gap-2 font-bold max-[650px]:text-4xl">
                  2млн<span className="text-ring">+</span>
                </h1>
                <p className="text-lg text-muted-foreground max-[650px]:text-sm">
                  Bu bizning mijozlarimiz uchun yaratgan ko'plab mazali
                  daqiqalar.
                </p>
              </div>
              <div className="">
                <h1 className="text-7xl flex gap-2 font-bold max-[650px]:text-4xl">
                  1200<span className="text-ring">+</span>
                </h1>
                <p className="text-lg text-muted-foreground max-[650px]:text-sm">
                  Bu shunchaki jamoa emas, bu do'stona oila.
                </p>
              </div>
            </div>
          </div> */}
        </div>
      </div>
    </div>
  );
};
export default AboutPage;
