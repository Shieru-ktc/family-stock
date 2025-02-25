import { apiClient } from "@/lib/apiClient";
import { useQuery } from "@tanstack/react-query";

export function useGetTagsQuery(familyId: string) {
    return useQuery({
        queryKey: ["family", familyId, "tags"],
        queryFn: async () => {
            const res = await apiClient.api.family[":familyId"].tags.$get({
                param: {
                    familyId: familyId,
                },
            });
            return await res.json();
        },
    });
}
