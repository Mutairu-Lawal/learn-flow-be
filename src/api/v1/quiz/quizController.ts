import type { Request, Response } from "express";
import { quizService } from "./quizService";

class QuizController {
	retrieveQuiz = async (_req: Request, res: Response) => {
		const serviceResponse = await quizService.getAllQuizzes();
		return res.status(serviceResponse.statusCode).send(serviceResponse);
	};
}

export const quizController = new QuizController();
