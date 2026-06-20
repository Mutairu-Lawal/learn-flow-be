import { OpenAPIRegistry, OpenApiGeneratorV3 } from "@asteasolutions/zod-to-openapi";
import { authRegistry } from "@/api/v1/auth/authRouter";
import { healthCheckRegistry } from "@/api/v1/healthCheck/healthCheckRouter";
import { topicRegistry } from "@/api/v1/topic/topicRouter";
import { userRegistry } from "@/api/v1/user/userRouter";
import { quizRegistry } from "@/api/v1/quiz/quizRouter";

export type OpenAPIDocument = ReturnType<OpenApiGeneratorV3["generateDocument"]>;

export function generateOpenAPIDocument(): OpenAPIDocument {
	const registry = new OpenAPIRegistry([healthCheckRegistry, userRegistry, authRegistry, topicRegistry,quizRegistry]);
	const generator = new OpenApiGeneratorV3(registry.definitions);

	return generator.generateDocument({
		openapi: "3.0.0",
		info: {
			version: "1.0.0",
			title: "Swagger API",
		},
		externalDocs: {
			description: "View the raw OpenAPI Specification in JSON format",
			url: "/swagger.json",
		},
	});
}
