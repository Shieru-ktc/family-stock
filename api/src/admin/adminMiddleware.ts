import { createMiddleware } from "hono/factory";

export const adminMiddleware = createMiddleware(async (c, next) => {
    const { token } = c.var.authUser;
    if (token?.role !== "ADMIN") {
        return c.json({ error: "Unauthorized" }, 401);
    }
    return next();
});
