import { cleanDatabase } from "./helpers/prisma.helper";

beforeAll(() => {
	console.log("setup is running");
});

beforeEach(async () => {
	await cleanDatabase();
	console.log("db cleaned");
});
