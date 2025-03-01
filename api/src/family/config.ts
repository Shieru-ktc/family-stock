import { FamilyOverride } from "@prisma/client";

export interface FamilyConfig {
    maxMembersPerFamily: number;
    maxStocksPerFamily: number;
    maxInvitesPerFamily: number;
    maxTagsPerFamily: number;
}

export function defaultConfig(): FamilyConfig {
    return {
        maxMembersPerFamily: 5,
        maxStocksPerFamily: 50,
        maxInvitesPerFamily: 5,
        maxTagsPerFamily: 10,
    };
}

export function applyOverrides(
    config: FamilyConfig,
    overrides: FamilyOverride[],
): FamilyConfig {
    return overrides.reduce((acc, o) => {
        const key = o.parameter as keyof FamilyConfig;
        return {
            ...acc,
            [key]: o.value,
        };
    }, config);
}
