declare module "bun" {
    interface Env {
        DATABASE_URL: string;

        AUTH_URL: string;
        AUTH_SECRET: string;

        GITHUB_ID: string;
        GITHUB_SECRET: string;

        DISCORD_ID: string;
        DISCORD_SECRET: string;

        HOSTNAME: string;
        PORT: string;
    }
}
