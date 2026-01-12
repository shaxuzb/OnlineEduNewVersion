"use client";

import { Button } from "@/components/ui/button";
import { Rating, RatingButton } from "@/components/ui/rating";
import { Sheet, SheetContent, SheetHeader } from "@/components/ui/sheet";
import { CommentData } from "@/types/interface";
import { ArrowLeft, X } from "lucide-react";
import { FC } from "react";
import NoComment from "@/assets/images/nocomment.webp";
import Image from "next/image";
import { useTranslations } from "next-intl";

interface CommentModalProps {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  data: CommentData[];
}
const CommentModal: FC<CommentModalProps> = ({ data, open, setOpen }) => {
  const t = useTranslations();
  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetContent className="w-full sm:w-[500px] flex flex-col h-full gap-2 overflow-hidden">
        <SheetHeader className="border-b py-2 shrink-0">
          <div className="flex justify-between items-center">
            <div className="flex gap-3 items-center">
              <Button
                variant="ghost"
                className="py-3 w-9 hidden max-[640px]:block"
                onClick={() => setOpen(false)}
              >
                <ArrowLeft className="size-4" />
              </Button>
              <h1 className="text-xl font-bold">{t("Comment.titleProduct")}</h1>
            </div>
            <Button
              variant="ghost"
              className="py-3 w-9 rounded-full max-[640px]:hidden"
              onClick={() => setOpen(false)}
            >
              <X className="size-4" />
            </Button>
          </div>
        </SheetHeader>

        {data.length === 0 ? (
          <div className="flex justify-center items-center grow w-full px-5">
            <div className="flex flex-col items-center justify-center">
              <Image src={NoComment} alt="No comment" className="w-3/4" />
              <h1 className="text-2xl font-medium text-center mt-5">
                {t("Comment.noComment.title")}
              </h1>
              <p className="text-muted-foreground text-center mt-2">
                {t("Comment.noComment.description")}
              </p>
            </div>
          </div>
        ) : (
          <div className="flex flex-col grow overflow-auto px-4">
            <h5 className="pb-2 sticky top-0 bg-background z-10">
              {data.length} {t("Comment.comment")}
            </h5>
            <div className="flex flex-col gap-4 mt-4">
              {data.map((item) => {
                const formatted = new Date(item.created_at).toLocaleDateString(
                  "en-US",
                  { year: "numeric", month: "long", day: "numeric" }
                );
                return (
                  <div
                    key={item.id}
                    className="flex flex-col bg-secondary p-3 rounded-lg"
                  >
                    <h1 className="text-lg font-semibold">{item.user.name}</h1>
                    <span className="text-sm text-muted-foreground">
                      {formatted}
                    </span>
                    <Rating readOnly value={item.rating} className="mt-2.5">
                      {Array.from({ length: 5 }).map((_, index) => (
                        <RatingButton key={index} />
                      ))}
                    </Rating>
                    <p className="mt-4">{item.comment}</p>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
};

export default CommentModal;
