"use client";
import { useEffect } from "react";
import { getCookie } from "cookies-next";
import { useAppDispatch } from "@/store/hooks";
import { logout } from "@/store/features/authSlice";
import { setAddressAdd } from "@/store/features/cartListSlice";

export default function TokenSync() {
  const dispatch = useAppDispatch();
  useEffect(() => {
    const cookieToken = getCookie("access_token");

    if (!cookieToken) {
      dispatch(logout());
      dispatch(setAddressAdd(null));
    }
  }, [getCookie("access_token")]);

  return null;
}
