import type { Metadata } from "next";
// import Script from "next/script";
import localFont from "next/font/local";
import "./globals.css";
import "swiper/css";
import { hasLocale, NextIntlClientProvider } from "next-intl";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import StoreProvider from "./StoreProvider";
import ProgressBarProvider from "@/components/ProgressBarLoading";
import TokenSync from "./TokenSync";
import ReactQueryProvider from "./ReactQueryProvider";
import Script from "next/script";
import { SEO } from "@/lib/seo";
const walsheimPro = localFont({
  src: [
    {
      path: "../fonts/GTWalsheimPro-Light.woff2",
      weight: "300",
      style: "normal",
    },
    {
      path: "../fonts/GTWalsheimPro-Regular.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "../fonts/GTWalsheimPro-Medium.woff2",
      weight: "500",
      style: "normal",
    },
    {
      path: "../fonts/GTWalsheimPro-Bold.woff2",
      weight: "700",
      style: "normal",
    },
    {
      path: "../fonts/GTWalsheimPro-UltraBold.woff2",
      weight: "800",
      style: "normal",
    },
    {
      path: "../fonts/GTWalsheimPro-Black.woff2",
      weight: "900",
      style: "normal",
    },
  ],
  variable: "--font-gt-walsheim",
});
export async function generateMetadata({ params }: any): Promise<Metadata> {
  const { locale } = await params;

  const currentLocale = routing.locales.includes(locale as any)
    ? locale
    : "uz";

  const seo = SEO[currentLocale as keyof typeof SEO];

  return {
    title: seo.title,
    description: seo.description,
    keywords: seo.keywords,

    metadataBase: new URL("https://baxtrestoran.uz"),

    icons: {
      icon: [{ url: "/favicon.ico" }],
      // apple: "/apple-touch-icon.png",
    },

    alternates: {
      languages: {
        uz: "https://baxtrestoran.uz",
        ru: "https://baxtrestoran.uz/ru",
        en: "https://baxtrestoran.uz/en",
      },
    },

    openGraph: {
      title: seo.title,
      description: seo.description,
      url: `https://baxtrestoran.uz/${currentLocale}`,
      images: "/logo3.png",
      siteName: "Baxt Restoran",
      type: "website",
      locale: currentLocale === "ru" ? "ru_RU" : currentLocale === "en" ? "en_US" : "uz_UZ",
    },
  };
}
// export const metadata: Metadata = {
//   title: "Baxt Restoran",
//   description:
//     "После оформления заказа Пользователь имеет право сделать отмену только в случае, если заказ еще не был приготовлен. Если заказ уже готов, Пользователь обязан оплатить заказ. В случае отказа Пользователя от оплаты заказа после его приготовления, заведение, в котором он был сделан либо Baxt Restoran оставляют за собой право обратиться в суд за возмещением суммы заказа с Пользователя. Исключением являются заказы, которые не были выполнены в течение более 2х часов после оформления по вине заведения или Baxt Restoran. В случае столь сильной задержки, пользователь также имеет право отказаться от заказа.",
//   keywords: "baxt restoran samarqand nomer1 fastfood fast food",
//   icons: {
//     icon: [
//       { url: "/favicon.ico" },
//       { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
//     ],
//     apple: "/apple-touch-icon.png",
//   },

//   openGraph: {
//     url: "https://baxtrestoran.uz",
//     siteName: "Baxt Restoran",
//     type: "website",
//     // siteName: "Baxt Restoran",
//     title: "Baxt Restoran",
//     description:
//       "После оформления заказа Пользователь имеет право сделать отмену только в случае, если заказ еще не был приготовлен. Если заказ уже готов, Пользователь обязан оплатить заказ. В случае отказа Пользователя от оплаты заказа после его приготовления, заведение, в котором он был сделан либо Baxt Restoran оставляют за собой право обратиться в суд за возмещением суммы заказа с Пользователя. Исключением являются заказы, которые не были выполнены в течение более 2х часов после оформления по вине заведения или Baxt Restoran. В случае столь сильной задержки, пользователь также имеет право отказаться от заказа.",
//   },
// };

export default async function RootLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}>) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  return (
    <html lang={locale}>
      <head>
        <Script
          async
          src="https://www.googletagmanager.com/gtag/js?id=G-1MNNNWVSFY"
        />

        <Script id="google-analytics">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-1MNNNWVSFY');
          `}
        </Script>
      </head>
      <body className={`${walsheimPro.className} antialiased`}>
        <StoreProvider>
          <NextIntlClientProvider>
            <ReactQueryProvider>
              <ProgressBarProvider>
                <TokenSync />
                {children}
              </ProgressBarProvider>
            </ReactQueryProvider>
          </NextIntlClientProvider>
        </StoreProvider>
      </body>
      {/* <Script src="https://api-maps.yandex.ru/2.1/?apikey=1fefb563-821c-4a64-90d3-1db6133f51c8&lang=ru_RU" /> */}
    </html>
  );
}
