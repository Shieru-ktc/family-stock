import { StockItemWithPartialMeta } from "@/types";
import { Button } from "./ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function Stock({ stock }: { stock: StockItemWithPartialMeta }) {
  return (
    <div className="flex p-4 shadow-xl rounded-md border-slate-200 border m-2 items-center">
      <div className="p-2">
        <h2 className="text-xl font-bold">りんご</h2>
        <div>赤い果物</div>
      </div>
      <div className="p-2 flex-grow"></div>

      <div className="flex items-center">
        <Button variant="ghost">
          <ChevronLeft />
        </Button>
        <span className="text-3xl">2</span>
        <Button variant="ghost">
          <ChevronRight />
        </Button>
      </div>
    </div>
  );
}
