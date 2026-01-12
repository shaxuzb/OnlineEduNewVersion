"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Rating, RatingButton } from "@/components/ui/rating";
import { useTranslations } from "next-intl";
import { FC } from "react";
import { Formik, Form } from "formik";
import * as Yup from "yup";
import { Textarea } from "@/components/ui/textarea";
import { X } from "lucide-react";
import { useCreateComment } from "@/services/mutate";

interface AddCommentProps {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  productId: number | null;
  setProductId: React.Dispatch<React.SetStateAction<number | null>>;
}

const AddCommentSchema = Yup.object().shape({
  rating: Yup.number().required("Comment.addRating"),
  comment: Yup.string().min(3, "Comment.min").required("Comment.required"),
});

const AddComment: FC<AddCommentProps> = ({
  open,
  productId,
  setOpen,
  setProductId,
}) => {
  const t = useTranslations();
  const handleClose = () => {
    setOpen(false);
    setProductId(null);
  };
  const mutation = useCreateComment(productId!);
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="!max-w-[440px]" showCloseButton={false}>
        <DialogHeader>
          <div className="flex justify-between items-center">
            <DialogTitle>{t("Comment.addComment")}</DialogTitle>
            <Button
              variant={"ghost"}
              className="py-3 w-9 max-[640px]:hidden"
              onClick={handleClose}
            >
              <X className="size-4" />
            </Button>
          </div>
        </DialogHeader>

        <Formik
          initialValues={{ rating: 0, comment: "" }}
          validationSchema={AddCommentSchema}
          onSubmit={(values, { resetForm }) => {
            mutation.mutate(values, {
              onSuccess: () => {
                setProductId(null);
                setOpen(false);
                resetForm();
              },
            });
          }}
        >
          {({ values, setFieldValue, errors, touched, isSubmitting }) => (
            <Form className="space-y-4">
              {/* ⭐ Rating */}
              <div>
                <Rating
                  value={values.rating}
                  onValueChange={(val) => setFieldValue("rating", val)}
                  className="mt-2.5"
                >
                  {Array.from({ length: 5 }).map((_, index) => (
                    <RatingButton size={30} key={index} />
                  ))}
                </Rating>
                {errors.rating && touched.rating && (
                  <p className="text-red-500 text-sm mt-1">
                    {t(errors.rating)}
                  </p>
                )}
              </div>

              {/* 📝 Izoh */}
              <div>
                <Textarea
                  value={values.comment}
                  placeholder={t("Comment.placeHolder")}
                  onChange={(e) => {
                    setFieldValue("comment", e.target.value);
                  }}
                />
                {errors.comment && touched.comment && (
                  <p className="text-red-500 text-sm mt-1">
                    {t(errors.comment)}
                  </p>
                )}
              </div>

              {/* 🚀 Submit */}
              <div className="flex justify-end">
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className=" text-white"
                >
                  {isSubmitting && <span className="loader !size-4"></span>}
                  {t("Buttons.save")}
                </Button>
              </div>
            </Form>
          )}
        </Formik>
      </DialogContent>
    </Dialog>
  );
};

export default AddComment;
