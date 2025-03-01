import { cn } from "@/lib/utils";
import Link from "next/link";

export default function Banner() {
    return (
        <div className={cn("min-w-max bg-green-900 p-2 py-1 text-green-200")}>
            <div className="text-md inline-flex gap-2">
                <p>Family Stock テクニカルプレビュー版</p>
                <Link
                    href="/main/news/f1w4whuhjb"
                    className="text-green-400 underline"
                >
                    詳細はこちら。
                </Link>
            </div>
        </div>
    );
}
