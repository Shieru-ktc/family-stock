"use client";

import { useMutation } from "@tanstack/react-query";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { apiClient } from "@/lib/apiClient";
import { useRouter } from "next/navigation";

export default function FamilyCreatePage() {
    const router = useRouter();
    const createFamily = useMutation({
        mutationFn: (name: string) => {
            return apiClient.api.family.$post({
                json: {
                    name,
                },
            });
        },
        onSuccess: async (res) => {
            if (res.ok) {
                const family = await res.json();
                router.push(`/main/family/${family.id}`);
            }
        },
    });

    return (
        <div>
            <h1 className="text-2xl">ファミリーを作成</h1>
            <p>ファミリーを作成すると、家族全員で在庫状況を管理できます。</p>
            <form
                onSubmit={(e) => {
                    e.preventDefault();
                    const formData = new FormData(e.target as HTMLFormElement);
                    const familyName = formData.get("name") as string;
                    createFamily.mutate(familyName);
                }}
            >
                <label>
                    ファミリー名:
                    <Input type="text" name="name" />
                </label>
                <Button type="submit">作成する</Button>
            </form>
        </div>
    );
}
