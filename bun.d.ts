declare module "bun" {
    interface Env {
        DATABASE_URL: string;

        NEXTAUTH_URL: string;
        AUTH_SECRET: string;

        GITHUB_ID: string;
        GITHUB_SECRET: string;

        DISCORD_ID: string;
        DISCORD_SECRET: string;

        HOSTNAME: string;
        PORT: string;

        API_URL: string;
    }
}
