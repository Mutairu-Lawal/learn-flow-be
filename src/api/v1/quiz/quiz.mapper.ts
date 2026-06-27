import type { CreateQuizInput } from "./quizSchema";

export function quizMapper(input: CreateQuizInput) {
	const { passMark, questions, timeLimitMs, topicId } = input;
	return {
		passMark,
		timeLimitMs,
		topic: {
			connect: {
				id: topicId,
			},
		},

		questions: {
			create: questions.map((question) => ({
				text: question.text,

				options: {
					create: question.options.map((option) => ({
						text: option.text,
						isCorrect: option.isCorrect,
					})),
				},
			})),
		},
	};
}
