"use client";

import { familyAtom } from "@/atoms/familyAtom";
import { useAtom } from "jotai";

export default function FamilySubscriptionPage() {
    const [family] = useAtom(familyAtom);

    return family ?
            <div>
                <h1 className="text-2xl">サブスクリプションの管理</h1>
                <hr className="my-2" />
                <p>テクニカルプレビュー版ではご利用いただけません。</p>
            </div>
        :   <p>Family not found.</p>;
}
