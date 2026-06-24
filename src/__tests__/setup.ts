import { cleanDatabase } from "./helpers/prisma.helper";

beforeEach(async () => {
	await cleanDatabase();
});
