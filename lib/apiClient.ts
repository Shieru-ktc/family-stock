import { ApiAppType } from "@/api/src";
import { hc } from "hono/client";
import { toast } from "sonner";

export const apiClient = hc<ApiAppType>(
    process.env.NODE_ENV === "production"
        ? "https://stocks-api.shieru-lab.com"
        : "http://localhost:3030",
    {
        fetch: async (
            req: string | Request | URL,
            init: RequestInit | undefined,
        ) => {
            const res = await fetch(req, {
                ...init,
                credentials: "include",
            });
            if (res.ok) {
                return res;
            } else {
                const data = await res.clone().json();
                if ("error" in data) {
                    toast.error(data.error, {
                        richColors: true,
                    });
                }

                return res;
            }
        },
    },
);
