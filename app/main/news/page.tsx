"use client";

import Tag from "@/components/Tag";
import Chip from "@/components/ui/chip";
import { microCmsClient } from "@/lib/microcms-client";
import { tagColorToCn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";

async function getNewsList() {
    const res = await microCmsClient.get({
        endpoint: "news",
        queries: { limit: 10 },
    });
    return res.contents;
}
export default function News() {
    const { data: posts } = useQuery({
        queryKey: ["news"],
        queryFn: getNewsList,
    });
    return (
        <div>
            <h1 className="text-2xl">お知らせ</h1>
            <div className="my-4">
                <p>各種お知らせはこちらから配信いたします。</p>
                <a
                    className="text-blue-700 underline dark:text-blue-300"
                    href="https://microcms.io"
                >
                    Powered by microCMS.
                </a>
            </div>

            <hr />
            <ul className="my-4 grid grid-cols-1 gap-4 lg:grid-cols-4">
                {posts &&
                    posts.map((post: any) => (
                        <li key={post.id}>
                            <div className="rounded-xl border p-4">
                                <Link
                                    href={`/main/news/${post.id}`}
                                    className="text-blue-700 underline dark:text-blue-300"
                                >
                                    {post.title}
                                </Link>
                                <Chip
                                    className={tagColorToCn(
                                        post.category.color[0],
                                    )}
                                >
                                    {post.category.name}
                                </Chip>
                                <div className="text-sm text-gray-500">
                                    <p>
                                        作成日時:{" "}
                                        {new Date(
                                            post.createdAt,
                                        ).toLocaleString()}
                                    </p>
                                    <p>
                                        更新日時:{" "}
                                        {new Date(
                                            post.updatedAt,
                                        ).toLocaleString()}
                                    </p>
                                </div>
                            </div>
                        </li>
                    ))}
            </ul>
        </div>
    );
}
