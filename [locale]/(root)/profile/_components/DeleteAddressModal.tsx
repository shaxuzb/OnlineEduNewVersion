import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogOverlay,
  DialogTitle,
} from "@/components/ui/dialog";
import { useDeleteAddress } from "@/services/mutate";

const DeleteAddressModal = ({
  open,
  setOpen,
  id,
}: {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  id: number;
}) => {
  const mutation = useDeleteAddress(id);
  const handleDelete = async () => {
    try {
      await mutation.mutateAsync();
      setOpen(false);
    } catch (error) {
      alert("Hatolik");
    }
  };
  return (
    <Dialog
      open={open}
      onOpenChange={(e) => {
        setOpen(e);
      }}
    >
      <DialogOverlay className="backdrop-blur-xs !bg-transparent" />
      <DialogContent className="w-96" showCloseButton={false}>
        <DialogHeader>
          <DialogTitle className="text-lg font-bold">
            Manzilni o'chirish:
          </DialogTitle>
        </DialogHeader>
        <div>
          <p className="text-muted-foreground text-xl">
            3-й проезд Урикзор, 49
          </p>
          <div className="grid grid-cols-2 mt-5 gap-2">
            <Button
              variant={"secondary"}
              className=""
              onClick={() => {
                setOpen(false);
              }}
            >
              Bekor qilish
            </Button>
            <Button variant={"destructive"} onClick={handleDelete}>
              O'chirish
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DeleteAddressModal;
