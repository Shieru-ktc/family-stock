"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "./ui/button";

export default function Counter({
  count,
  setCount,
}: {
  count: number;
  setCount: (count: number) => void;
}) {
  return (
    <>
      <Button
        variant="ghost"
        onClick={() => {
          setCount(count - 1);
        }}
      >
        <ChevronLeft />
      </Button>
      <span className="text-3xl">{count}</span>
      <Button
        variant="ghost"
        onClick={() => {
          setCount(count + 1);
        }}
      >
        <ChevronRight />
      </Button>
    </>
  );
}
