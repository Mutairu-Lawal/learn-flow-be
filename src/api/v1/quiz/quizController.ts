import type { Request, Response } from "express";
import type { UserPayload } from "../user/userSchema";
import type { CreateQuizInput, QuizSubmission } from "./quizSchema";
import { quizService } from "./quizService";

class QuizController {
	retrieveQuizzes = async (_req: Request, res: Response) => {
		const serviceResponse = await quizService.getAllQuizzes();
		return res.status(serviceResponse.statusCode).send(serviceResponse);
	};

	retrieveQuiz = async (req: Request<{ slug: string }>, res: Response) => {
		const serviceResponse = await quizService.getQuiz(req.params.slug);
		return res.status(serviceResponse.statusCode).send(serviceResponse);
	};

	create = async (req: Request<unknown, unknown, CreateQuizInput>, res: Response) => {
		const serviceResponse = await quizService.createQuiz(req.body);
		return res.status(serviceResponse.statusCode).send(serviceResponse);
	};

	postAnswers = async (req: Request<{ sessionToken: string }, unknown, QuizSubmission>, res: Response) => {
		const serviceResponse = await quizService.submitAnswers(req.body, req.params.sessionToken, req.user as UserPayload);
		return res.status(serviceResponse.statusCode).send(serviceResponse);
	};
}

export const quizController = new QuizController();
