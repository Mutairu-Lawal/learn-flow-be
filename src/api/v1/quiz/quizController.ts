import type { Request, Response } from "express";

import type { CreateQuizInput } from "./quizSchema";
import { quizService } from "./quizService";

class QuizController {
	retrieveQuiz = async (_req: Request, res: Response) => {
		const serviceResponse = await quizService.getAllQuizzes();
		return res.status(serviceResponse.statusCode).send(serviceResponse);
	};

	create = async (req: Request<unknown, unknown, CreateQuizInput>, res: Response) => {
		const serviceResponse = await quizService.createQuiz(req.body);
		return res.status(serviceResponse.statusCode).send(serviceResponse);
	};
}

export const quizController = new QuizController();
