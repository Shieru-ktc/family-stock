import { apiClient } from "@/lib/apiClient";
import { useQuery } from "@tanstack/react-query";

export function useGetStocksQuery(familyId: string) {
    return useQuery({
        queryKey: ["family", familyId, "stocks"],
        queryFn: async () => {
            const response = await apiClient.api.family[
                ":familyId"
            ].stocks.$get({
                param: { familyId },
            });
            return response.json();
        },
        select: (data) =>
            data.map((stock) => ({
                ...stock,
                createdAt: new Date(stock.createdAt),
                Meta: {
                    ...stock.Meta,
                    createdAt: new Date(stock.Meta.createdAt),
                },
            })),
        refetchOnMount: "always",
        refetchOnReconnect: "always",
        refetchOnWindowFocus: "always",
    });
}