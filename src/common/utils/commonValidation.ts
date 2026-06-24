import { z } from "zod";

//! Remove this
// export const commonValidations = {
// 	id: z
// 		.string()
// 		.refine((data) => !Number.isNaN(Number(data)), "ID must be a numeric value")
// 		.transform(Number)
// 		.refine((num) => num > 0, "ID must be a positive number"),
// 	// ... other common validations
// };

export const commonIdSchema = z.object({
	id: z.coerce.number().int().positive().min(1),
});
