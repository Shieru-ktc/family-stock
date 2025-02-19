"use client";

import { sessionAtom } from "@/atoms/sessionAtom";
import AuthButtons from "@/components/AuthButtons";
import { useAtomValue } from "jotai";

export default function Home() {
    const session = useAtomValue(sessionAtom);
    return <AuthButtons session={session} />;
}
