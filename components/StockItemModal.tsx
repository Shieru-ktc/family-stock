import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";

export default function StockItemModal() {
  return (
    <Dialog>
      <DialogTrigger>Open</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>在庫アイテム</DialogTitle>

          <div className="flex">
            <Label className="w-[90%]">
              アイテム名 <Input />
            </Label>

            <Label>
              個数
              <Input type="number" />
            </Label>
          </div>

          <Label className="">
            詳細説明
            <Textarea rows={5} className="resize-none" />
          </Label>
          <Label>
            価格
            <Input inputMode="numeric" />
          </Label>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
}
