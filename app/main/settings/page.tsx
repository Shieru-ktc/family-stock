"use client";

import { socketAtom } from "@/atoms/socketAtom";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import Chip from "@/components/ui/chip";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn, tagColorToCn } from "@/lib/utils";
import { TagColor } from "@prisma/client";
import { useAtomValue } from "jotai";
import { CircleHelp } from "lucide-react";
import { useTheme } from "next-themes";

export default function SettingsPage() {
    const { resolvedTheme, setTheme } = useTheme();
    const socket = useAtomValue(socketAtom);

    const toggleTheme = () => {
        setTheme(resolvedTheme === "dark" ? "light" : "dark");
    };

    return (
        <div>
            <Button onClick={toggleTheme}>
                {resolvedTheme === "dark"
                    ? "ライトテーマに変更"
                    : "ダークテーマに変更"}
            </Button>
            <Card className="my-2 w-96">
                <CardHeader>
                    <CardTitle>WebSocket 接続ステータス</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="inline-flex items-center gap-4 text-lg">
                        Ping: {socket.lastPingMs}ms
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger>
                                    <CircleHelp size={"16"} color="gray" />
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p>
                                        Pingとは、あなたとWebSocketサーバーが会話するためにどれくらいの時間がかかるかを表します。
                                        <br />
                                        この値が小さければ小さいほど、通信環境が良く、快適にアプリケーションを使えることを示します。
                                        <br />
                                        200msより大きくなると、利用中に違和感を感じることがあります。
                                    </p>
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
