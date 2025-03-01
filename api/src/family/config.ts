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