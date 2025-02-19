"use client";

import { sessionAtom } from "@/atoms/sessionAtom";
import { useAtomValue } from "jotai";

export default function ProfilePage() {
    const session = useAtomValue(sessionAtom);
    return (
        <div>
            <h1>{session?.user?.name}'s Profile</h1>
        </div>
    );
}
