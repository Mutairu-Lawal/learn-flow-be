import type { ZodType } from "zod";

export function parseEntityId(id: string, validator: ZodType<number>): number | null {
	const parsed = validator.safeParse(id);

	return parsed.success ? parsed.data : null;
}

export async function findEntity<T>(id: number, fetcher: (id: number) => Promise<T | null>): Promise<T | null> {
	return fetcher(id);
}
