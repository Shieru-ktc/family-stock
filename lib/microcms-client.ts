import { createClient } from "microcms-js-sdk";

export const microCmsClient = createClient({
    serviceDomain: "family-stock",
    apiKey: "unlhka4LvpsPoHagKw7vgEpMao1zv3J6UR72", // 本来APIキーは公開すべきでないが、まあread-onlyなので・・・
});
