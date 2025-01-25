"use client";

import { ShoppingGetResponse } from "@/app/api/family/[familyId]/shopping/route";
import { useQuery } from "@tanstack/react-query";
import { use } from "react";
import ShoppingCreatePage from "./ShoppingCreatePage";
import OnGoingShoppingPage from "./ShoppingPage";

export default function ShoppingPage({
  params,
}: {
  params: Promise<{ familyId: string }>;
}) {
  const familyId = use(params).familyId;
  const { data: ongoingShopping, isPending } = useQuery<ShoppingGetResponse>({
    queryKey: ["family", familyId, "shopping"],
    queryFn: async () => {
      const response = await fetch(`/api/family/${familyId}/shopping`);
      return response.json();
    },
    refetchOnMount: "always",
    refetchOnReconnect: "always",
    refetchOnWindowFocus: "always",
  });

  if (isPending) {
    return <div>loading...</div>;
  } else if (ongoingShopping?.success && ongoingShopping.shopping) {
    return <OnGoingShoppingPage shopping={ongoingShopping.shopping} />;
  } else {
    return <ShoppingCreatePage familyId={familyId} />;
  }
}
