"use client";

import { usePathname, useRouter } from "@/i18n/navigation";
import { useLocale } from "next-intl";

export default function DocsButton() {
  const router = useRouter();
  const pathname = usePathname();
  const locale = useLocale();
  const handleChange = (e: { target: { value: any } }) => {
    router.replace(pathname, { locale: e.target.value });
  };
  return (
    <select
      value={locale}
      onChange={handleChange}
      className="border px-2 py-1 rounded"
    >
      <option value="uz">UZ</option>
      <option value="ru">RU</option>
      <option value="en">EN</option>
    </select>
  );
}
