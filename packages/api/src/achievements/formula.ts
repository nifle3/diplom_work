type BinaryOperator =
	| "+"
	| "-"
	| "*"
	| "/"
	| "%"
	| "=="
	| "!="
	| ">"
	| ">="
	| "<"
	| "<="
	| "&&"
	| "||";

type UnaryOperator = "-" | "!";

type Token =
	| { type: "number"; value: number }
	| { type: "identifier"; value: string }
	| { type: "operator"; value: BinaryOperator | UnaryOperator }
	| { type: "paren"; value: "(" | ")" };

type FormulaNode =
	| { type: "number"; value: number }
	| { type: "identifier"; value: string }
	| { type: "unary"; operator: UnaryOperator; argument: FormulaNode }
	| {
			type: "binary";
			operator: BinaryOperator;
			left: FormulaNode;
			right: FormulaNode;
	  };

export const ACHIEVEMENT_FORMULA_VARIABLES = [
	"xp",
	"streak",
	"interviewCount",
	"completedInterviews",
	"canceledInterviews",
	"averageScore",
	"bestScore",
	"lastScore",
	"achievementCount",
	"interviewsToday",
	"completedToday",
	"daysSinceLastInterview",
	"daysSinceLastCompletedInterview",
] as const;

export type AchievementFormulaVariable =
	(typeof ACHIEVEMENT_FORMULA_VARIABLES)[number];

export type AchievementFormulaContext = Record<
	AchievementFormulaVariable,
	number
>;

const operators = [
	"&&",
	"||",
	">=",
	"<=",
	"==",
	"!=",
	">",
	"<",
	"+",
	"-",
	"*",
	"/",
	"%",
	"!",
] as const;

function isDigit(char: string | undefined) {
	return !!char && char >= "0" && char <= "9";
}

function isIdentifierStart(char: string | undefined) {
	return !!char && /[A-Za-z_]/.test(char);
}

function isIdentifierPart(char: string | undefined) {
	return !!char && /[A-Za-z0-9_]/.test(char);
}

function tokenize(formula: string): Token[] {
	const tokens: Token[] = [];
	let index = 0;

	while (index < formula.length) {
		const char = formula[index];

		if (char !== undefined && /\s/.test(char)) {
			index++;
			continue;
		}

		const twoCharOperator = formula.slice(index, index + 2);
		if (operators.includes(twoCharOperator as (typeof operators)[number])) {
			tokens.push({
				type: "operator",
				value: twoCharOperator as BinaryOperator | UnaryOperator,
			});
			index += 2;
			continue;
		}

		if (operators.includes(char as (typeof operators)[number])) {
			tokens.push({
				type: "operator",
				value: char as BinaryOperator | UnaryOperator,
			});
			index++;
			continue;
		}

		if (char === "(" || char === ")") {
			tokens.push({ type: "paren", value: char });
			index++;
			continue;
		}

		if (isDigit(char) || (char === "." && isDigit(formula[index + 1]))) {
			let end = index + 1;
			while (end < formula.length) {
				const currentChar = formula[end];
				if (currentChar === undefined || !/[0-9.]/.test(currentChar)) {
					break;
				}

				end++;
			}

			const value = Number(formula.slice(index, end));
			if (Number.isNaN(value)) {
				throw new Error(
					`Invalid number in formula near "${formula.slice(index, end)}"`,
				);
			}

			tokens.push({ type: "number", value });
			index = end;
			continue;
		}

		if (isIdentifierStart(char)) {
			let end = index + 1;
			while (end < formula.length && isIdentifierPart(formula[end])) {
				end++;
			}

			tokens.push({
				type: "identifier",
				value: formula.slice(index, end),
			});
			index = end;
			continue;
		}

		throw new Error(`Unexpected character "${char}" in formula`);
	}

	return tokens;
}

class FormulaParser {
	private readonly tokens: Token[];

	private position = 0;

	constructor(formula: string) {
		this.tokens = tokenize(formula);
	}

	parse() {
		const expression = this.parseOr();
		if (this.current()) {
			throw new Error("Unexpected token at the end of formula");
		}

		return expression;
	}

	private current() {
		return this.tokens[this.position];
	}

	private consume() {
		return this.tokens[this.position++];
	}

	private match(...expected: Array<BinaryOperator | UnaryOperator>) {
		const token = this.current();
		if (
			!token ||
			token.type !== "operator" ||
			!expected.includes(token.value)
		) {
			return false;
		}

		this.position++;
		return true;
	}

	private matchParen(value: "(" | ")") {
		const token = this.current();
		if (!token || token.type !== "paren" || token.value !== value) {
			return false;
		}

		this.position++;
		return true;
	}

	private parseOr(): FormulaNode {
		let node = this.parseAnd();

		while (this.match("||")) {
			node = {
				type: "binary",
				operator: "||",
				left: node,
				right: this.parseAnd(),
			};
		}

		return node;
	}

	private parseAnd(): FormulaNode {
		let node = this.parseEquality();

		while (this.match("&&")) {
			node = {
				type: "binary",
				operator: "&&",
				left: node,
				right: this.parseEquality(),
			};
		}

		return node;
	}

	private parseEquality(): FormulaNode {
		let node = this.parseComparison();

		while (this.match("==", "!=")) {
			const operator = this.tokens[this.position - 1]?.value as "==" | "!=";
			node = {
				type: "binary",
				operator,
				left: node,
				right: this.parseComparison(),
			};
		}

		return node;
	}

	private parseComparison(): FormulaNode {
		let node = this.parseAdditive();

		while (this.match(">", ">=", "<", "<=")) {
			const operator = this.tokens[this.position - 1]?.value as
				| ">"
				| ">="
				| "<"
				| "<=";
			node = {
				type: "binary",
				operator,
				left: node,
				right: this.parseAdditive(),
			};
		}

		return node;
	}

	private parseAdditive(): FormulaNode {
		let node = this.parseMultiplicative();

		while (this.match("+", "-")) {
			const operator = this.tokens[this.position - 1]?.value as "+" | "-";
			node = {
				type: "binary",
				operator,
				left: node,
				right: this.parseMultiplicative(),
			};
		}

		return node;
	}

	private parseMultiplicative(): FormulaNode {
		let node = this.parseUnary();

		while (this.match("*", "/", "%")) {
			const operator = this.tokens[this.position - 1]?.value as "*" | "/" | "%";
			node = {
				type: "binary",
				operator,
				left: node,
				right: this.parseUnary(),
			};
		}

		return node;
	}

	private parseUnary(): FormulaNode {
		if (this.match("!", "-")) {
			const operator = this.tokens[this.position - 1]?.value as UnaryOperator;
			return {
				type: "unary",
				operator,
				argument: this.parseUnary(),
			};
		}

		return this.parsePrimary();
	}

	private parsePrimary(): FormulaNode {
		const token = this.current();

		if (!token) {
			throw new Error("Unexpected end of formula");
		}

		if (token.type === "number") {
			this.consume();
			return { type: "number", value: token.value };
		}

		if (token.type === "identifier") {
			this.consume();
			return { type: "identifier", value: token.value };
		}

		if (token.type === "paren" && token.value === "(") {
			this.consume();
			const expression = this.parseOr();
			if (!this.matchParen(")")) {
				throw new Error("Missing closing parenthesis in formula");
			}

			return expression;
		}

		throw new Error(`Unexpected token "${String(token.type)}" in formula`);
	}
}

function collectIdentifiers(
	node: FormulaNode,
	identifiers = new Set<string>(),
) {
	switch (node.type) {
		case "identifier":
			if (node.value !== "true" && node.value !== "false") {
				identifiers.add(node.value);
			}
			break;
		case "binary":
			collectIdentifiers(node.left, identifiers);
			collectIdentifiers(node.right, identifiers);
			break;
		case "unary":
			collectIdentifiers(node.argument, identifiers);
			break;
		default:
			break;
	}

	return identifiers;
}

function evaluateNode(
	node: FormulaNode,
	context: AchievementFormulaContext,
): number | boolean {
	switch (node.type) {
		case "number":
			return node.value;
		case "identifier":
			if (node.value === "true") {
				return true;
			}

			if (node.value === "false") {
				return false;
			}

			if (!(node.value in context)) {
				throw new Error(`Unknown formula variable "${node.value}"`);
			}

			return context[node.value as AchievementFormulaVariable];
		case "unary": {
			const value = evaluateNode(node.argument, context);
			if (node.operator === "!") {
				return !value;
			}

			return -toNumber(value);
		}
		case "binary": {
			const left = evaluateNode(node.left, context);
			const right = evaluateNode(node.right, context);

			switch (node.operator) {
				case "+":
					return toNumber(left) + toNumber(right);
				case "-":
					return toNumber(left) - toNumber(right);
				case "*":
					return toNumber(left) * toNumber(right);
				case "/":
					return toNumber(left) / toNumber(right);
				case "%":
					return toNumber(left) % toNumber(right);
				case "==":
					return left === right;
				case "!=":
					return left !== right;
				case ">":
					return toNumber(left) > toNumber(right);
				case ">=":
					return toNumber(left) >= toNumber(right);
				case "<":
					return toNumber(left) < toNumber(right);
				case "<=":
					return toNumber(left) <= toNumber(right);
				case "&&":
					return Boolean(left) && Boolean(right);
				case "||":
					return Boolean(left) || Boolean(right);
				default:
					throw new Error("Unsupported operator in achievement formula");
			}
		}
	}
}

function toNumber(value: number | boolean) {
	if (typeof value !== "number") {
		throw new Error("Formula expression expected a numeric value");
	}

	return value;
}

export function assertAchievementFormulaIsValid(formula: string) {
	const trimmedFormula = formula.trim();

	if (!trimmedFormula) {
		throw new Error("Achievement formula cannot be empty");
	}

	const ast = new FormulaParser(trimmedFormula).parse();
	const identifiers = collectIdentifiers(ast);
	const unsupportedVariables = [...identifiers].filter(
		(identifier) =>
			!ACHIEVEMENT_FORMULA_VARIABLES.includes(
				identifier as AchievementFormulaVariable,
			),
	);

	if (unsupportedVariables.length > 0) {
		throw new Error(
			`Unknown formula variables: ${unsupportedVariables.join(", ")}`,
		);
	}

	return ast;
}

export function evaluateAchievementFormula(
	formula: string,
	context: AchievementFormulaContext,
) {
	const ast = assertAchievementFormulaIsValid(formula);
	return Boolean(evaluateNode(ast, context));
}
