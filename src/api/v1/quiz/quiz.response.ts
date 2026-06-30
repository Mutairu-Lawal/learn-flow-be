export function formatQuestions(
	questions: {
		options: {
			id: number;
			text: string;
			isCorrect: boolean;
		}[];
	}[],
) {
	return questions.map((question) => ({
		...question,
		options: question.options.map((option) => ({
			id: option.id,
			text: option.text,
			isCorrect: option.isCorrect,
		})),
	}));
}
