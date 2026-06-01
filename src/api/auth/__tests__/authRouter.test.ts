import { StatusCodes } from "http-status-codes";
import request from "supertest";
import { authRepository } from "@/api/auth/authRepository";
import { verifyToken } from "@/common/utils/jwt";
import { prisma } from "@/lib/prisma";
import { app } from "@/server";

const validSignupUser = {
	username: "testuser",
	email: "test@example.com",
	password: "Password123!",
};

const loginPayload = {
	identifier: "testuser",
	password: "Password123!",
};

describe("Auth Routes", () => {
	beforeAll(async () => {
		await prisma.$connect();
	});

	beforeEach(async () => {
		await prisma.user.deleteMany();
		vi.restoreAllMocks();
	});

	afterAll(async () => {
		await prisma.$disconnect();
	});

	describe("POST /auth/signup", () => {
		it("should create a new user", async () => {
			const res = await request(app).post("/auth/signup").send(validSignupUser);

			expect(res.status).toBe(StatusCodes.CREATED);
			expect(res.body.success).toBe(true);
			expect(res.body.message).toContain("created");
			expect(res.body.responseObject).toMatchObject({
				username: validSignupUser.username,
				email: validSignupUser.email,
			});
			expect(res.body.responseObject).toHaveProperty("id");
			expect(res.body.responseObject).toHaveProperty("createdAt");

			const persistedUser = await prisma.user.findUnique({
				where: { email: validSignupUser.email },
			});

			expect(persistedUser).not.toBeNull();
			expect(persistedUser?.email).toEqual(validSignupUser.email);
			expect(persistedUser?.username).toEqual(validSignupUser.username);
			expect(persistedUser?.password_hash).not.toEqual(validSignupUser.password);
		});

		it("should fail if email already exists", async () => {
			await request(app).post("/auth/signup").send(validSignupUser);

			const res = await request(app).post("/auth/signup").send({
				username: "anotheruser",
				email: validSignupUser.email,
				password: "Password123!",
			});

			expect(res.status).toBe(StatusCodes.BAD_REQUEST);
			expect(res.body.success).toBe(false);
			expect(res.body.message).toContain("User already exists");
		});

		it("should fail when required fields are missing", async () => {
			const res = await request(app).post("/auth/signup").send({
				username: "testuser",
			});

			expect(res.status).toBe(StatusCodes.BAD_REQUEST);
			expect(res.body.success).toBe(false);
			expect(res.body.message).toContain("Invalid input");
		});

		it("should fail with invalid signup payload", async () => {
			const res = await request(app).post("/auth/signup").send({
				username: "ab",
				email: "not-an-email",
				password: "123",
			});

			expect(res.status).toBe(StatusCodes.BAD_REQUEST);
			expect(res.body.success).toBe(false);
			expect(res.body.message).toContain("Invalid input");
			expect(res.body.message).toContain("username");
			expect(res.body.message).toContain("email");
			expect(res.body.message).toContain("password");
		});

		it("should return 500 when the repository fails during signup", async () => {
			vi.spyOn(authRepository, "findByEmailOrUsername").mockResolvedValue(null);
			vi.spyOn(authRepository, "create").mockRejectedValueOnce(new Error("Database unavailable"));

			const res = await request(app).post("/auth/signup").send(validSignupUser);

			expect(res.status).toBe(StatusCodes.INTERNAL_SERVER_ERROR);
			expect(res.body.success).toBe(false);
			expect(res.body.message).toContain("User creation failed");
		});
	});

	describe("POST /auth/login", () => {
		beforeEach(async () => {
			await request(app).post("/auth/signup").send(validSignupUser);
		});

		it("should login user with email", async () => {
			const res = await request(app).post("/auth/login").send({
				identifier: loginPayload.identifier,
				password: validSignupUser.password,
			});

			expect(res.status).toBe(StatusCodes.OK);
			expect(res.body.success).toBe(true);
			expect(res.body.responseObject).toHaveProperty("token");

			const decoded = verifyToken(res.body.responseObject.token);
			expect(decoded).not.toBeNull();
			expect(decoded?.userId).toBeDefined();
			expect(decoded?.role).toEqual("USER");
		});

		it("should login user with username", async () => {
			const res = await request(app).post("/auth/login").send({
				identifier: validSignupUser.username,
				password: validSignupUser.password,
			});

			expect(res.status).toBe(StatusCodes.OK);
			expect(res.body.success).toBe(true);
			expect(res.body.responseObject).toHaveProperty("token");
		});

		it("should fail with wrong password", async () => {
			const res = await request(app).post("/auth/login").send({
				identifier: validSignupUser.email,
				password: "WrongPassword",
			});

			expect(res.status).toBe(StatusCodes.UNAUTHORIZED);
			expect(res.body.success).toBe(false);
			expect(res.body.message).toContain("Invalid credentials");
		});

		it("should fail with unknown user credentials", async () => {
			const res = await request(app).post("/auth/login").send({
				identifier: "unknown@example.com",
				password: "Password123!",
			});

			expect(res.status).toBe(StatusCodes.UNAUTHORIZED);
			expect(res.body.success).toBe(false);
			expect(res.body.message).toContain("Invalid credentials");
		});

		it("should fail when required login fields are missing", async () => {
			const res = await request(app).post("/auth/login").send({
				identifier: validSignupUser.email,
			});

			expect(res.status).toBe(StatusCodes.BAD_REQUEST);
			expect(res.body.success).toBe(false);
			expect(res.body.message).toContain("Invalid input");
		});

		it("should fail with invalid login payload", async () => {
			const res = await request(app).post("/auth/login").send({
				identifier: "bad email",
				password: "short",
			});

			expect(res.status).toBe(StatusCodes.BAD_REQUEST);
			expect(res.body.success).toBe(false);
			expect(res.body.message).toContain("Invalid input");
		});

		it("should return 500 when the repository fails during login", async () => {
			vi.spyOn(authRepository, "findByEmail").mockRejectedValueOnce(new Error("Database down"));

			const res = await request(app).post("/auth/login").send({
				identifier: validSignupUser.email,
				password: validSignupUser.password,
			});

			expect(res.status).toBe(StatusCodes.INTERNAL_SERVER_ERROR);
			expect(res.body.success).toBe(false);
			expect(res.body.message).toContain("User authentication failed");
		});
	});
});
