import { ApiAppType } from "@/api/src";
import { hc } from "hono/client";

export class HcFetchError extends Error {
    constructor(public res: Response) {
        super(`${res.url} ${res.status} ${res.statusText}`);
    }
}

export const apiClient = hc<ApiAppType>(
    process.env.NODE_ENV === "production"
        ? "https://stocks-api.shieru-lab.com"
        : "http://localhost:3030",
    {
        fetch: async (req: string | Request | URL, init: RequestInit | undefined) => {
            const res = await fetch(req, {
                ...init,
                credentials: "include",
            });
            if (res.ok) {
                return res;
            } else {
                throw new HcFetchError(res);
            }
        }
    },
);
