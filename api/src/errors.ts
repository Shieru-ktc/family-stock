export class FamilyNotFoundError extends Error {}
export class NoPermissionError extends Error {
    constructor(requiredRole: string, currentRole: string) {
        super(`Required role: ${requiredRole}, Current role: ${currentRole}`);
    }
}
