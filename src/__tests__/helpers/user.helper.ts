import { faker } from "@faker-js/faker";

export const generateRandomUser = () => ({
	firstName: faker.person.firstName(),
	lastName: faker.person.lastName(),
	username: faker.internet.username(),
	email: faker.internet.email(),
	password: "securePassword123!",
});
