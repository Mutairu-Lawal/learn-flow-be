import type { QuizSubmission } from "./quizSchema";

type QuizDetails = {
	id: number;
	passMark: number;
	questions: {
		id: number;
		options: {
			id: number;
			text: string;
			isCorrect: boolean;
		}[];
	}[];
};

export type QuizScoreResult = {
	correctAnswers: number;
	incorrectAnswers: number;
	unansweredQuestions: number;
	totalQuestions: number;
	score: number;
	passed: boolean;
};

export function calculate(quiz: QuizDetails, submission: QuizSubmission): QuizScoreResult {
	const questionMap = new Map(quiz.questions.map((question) => [question.id, question]));

	let correctAnswers = 0;
	let incorrectAnswers = 0;

	for (const [questionId, answerId] of Object.entries(submission.answers)) {
		const question = questionMap.get(Number(questionId));

		if (!question) continue;

		const correctOption = question.options.find((option) => option.isCorrect);

		if (!correctOption) continue;

		if (correctOption.id === Number(answerId)) {
			correctAnswers++;
		} else {
			incorrectAnswers++;
		}
	}

	const totalQuestions = quiz.questions.length;
	const unansweredQuestions = totalQuestions - correctAnswers - incorrectAnswers;
	const score = totalQuestions === 0 ? 0 : Math.round((correctAnswers / totalQuestions) * 100);

	return {
		correctAnswers,
		incorrectAnswers,
		unansweredQuestions,
		totalQuestions,
		score,
		passed: score >= quiz.passMark,
	};
}
