import { ApiAppType } from "@/api/src";
import { hc } from "hono/client";

export const apiClient = hc<ApiAppType>(
    process.env.NODE_ENV === "production"
        ? "https://stocks-api.shieru-lab.com"
        : "http://localhost:3030",
    {
        fetch: (req: string | Request | URL, init: RequestInit | undefined) =>
            fetch(req, {
                ...init,
                credentials: "include",
            }),
    },
);
