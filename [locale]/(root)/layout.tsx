"use client";
import Footer from "@/components/footer";
import Navbar from "@/components/navbar";
import React from "react";
import CookieConsent from "@/components/CookieConsent";
import NotificationListener from "@/components/NotificationListener";
import { CartFlyImage } from "@/components/widgets/CartFlyImage";

const HomeLayout = ({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) => {

  return (
    <div className="flex flex-col w-full h-screen overflow-y-auto document-child">
      <NotificationListener />
      <CookieConsent />
      <Navbar />
      <div className="w-[1184px] max-[1184px]:w-full px-4 mx-auto flex-1">
        {children}
      </div>
      <Footer />
      <CartFlyImage />
    </div>
  );
};

export default HomeLayout;
