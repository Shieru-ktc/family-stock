"use client";

import Loading from "@/components/Loading";
import { microCmsClient } from "@/lib/microcms-client";
import { useQuery } from "@tanstack/react-query";
import { use } from "react";

async function getNewsPost(id: string) {
    const data = await microCmsClient.get({
        endpoint: `news/${id}`,
    });
    return data;
}

export default function NewsPost({
    params,
}: {
    params: Promise<{ newsId: string }>;
}) {
    const newsId = use(params).newsId;
    const { data: post } = useQuery({
        queryKey: ["news", newsId],
        queryFn: () => getNewsPost(newsId),
        select: (data) => {
            return {
                ...data,
                createdAt: new Date(data.createdAt),
                updatedAt: new Date(data.updatedAt),
            };
        },
    });

    return (
        <div>
            {post ? (
                <div className="mx-auto max-w-6xl p-2">
                    <h1 className="text-center text-3xl font-bold">
                        {post.title}
                    </h1>
                    <div className="mx-auto my-4 text-right text-sm">
                        <p>作成日時: {post.createdAt.toLocaleString()}</p>
                        <p>更新日時: {post.updatedAt.toLocaleString()}</p>
                    </div>

                    <hr />

                    <div
                        className="prose dark:prose-invert mx-auto my-4 max-w-screen-lg"
                        dangerouslySetInnerHTML={{ __html: post.content }}
                    />
                </div>
            ) : (
                <Loading />
            )}
        </div>
    );
}
