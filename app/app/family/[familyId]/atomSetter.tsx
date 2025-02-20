"use client";

import { ReactNode, useEffect } from "react";

import { familyAtom } from "@/atoms/familyAtom";
import { FamilyWithUserMember } from "@/types";
import { useQuery } from "@tanstack/react-query";
import { useSetAtom } from "jotai";

export default function FamilyPageAtomSetter({
  children,
  familyId,
}: {
  children: ReactNode;
  familyId: string;
}) {
  const setFamily = useSetAtom(familyAtom);
  const { data: family } = useQuery<FamilyWithUserMember>({
    queryKey: ["family", familyId],
    queryFn: () => fetch(`/api/family/${familyId}`).then((res) => res.json()),
  });

  useEffect(() => {
    setFamily(family);
  }, [family]);
  return <>{children}</>;
}
