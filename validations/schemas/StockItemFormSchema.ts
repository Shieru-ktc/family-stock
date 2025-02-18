import { z } from "zod";

export const StockItemFormSchema = z.object({
    name: z.string({
        required_error: "商品名を入力してください",
    }),
    description: z.string({
        required_error: "商品の説明を入力してください",
    }),
    unit: z.string({
        required_error: "単位を入力してください",
    }),
    price: z
        .number({
            required_error: "価格を入力してください",
            invalid_type_error: "価格は数値で入力してください",
        })
        .nonnegative({
            message: "価格は0以上で入力してください",
        }),
    quantity: z
        .number({
            required_error: "数量を入力してください",
            invalid_type_error: "数量は数値で入力してください",
        })
        .nonnegative({
            message: "数量は0以上で入力してください",
        }),
    step: z
        .number({
            required_error: "数量の増減単位を入力してください",
            invalid_type_error: "数量の増減単位は数値で入力してください",
        })
        .positive({
            message: "数量の増減単位は1以上で入力してください",
        }),
    threshold: z
        .number({
            required_error: "数量の閾値を入力してください",
            invalid_type_error: "数量の閾値は数値で入力してください",
        })
        .nonnegative({
            message: "数量の閾値は0以上で入力してください",
        }),
});
