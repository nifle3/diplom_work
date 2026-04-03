# LLM Package Test Cases

## packages/llm/src/index.test.ts
| Test Case | Type | What is checked |
|-----------|------|-----------------|
| should export necessary functions | Positive | Verifies that all core API functions are correctly exported from the package index. |

## packages/llm/src/interviewer/planInterviewStep.test.ts
| Test Case | Type | What is checked |
|-----------|------|-----------------|
| should call generateText with correct parameters | Positive | Ensures the interview planning logic calls the LLM with the right context and returns the structured decision/question. |
| should handle missing next topic and include summary | Positive | Verifies the behavior when the interview reaches its end or transitions without a specific next topic, including session summary. |

## packages/llm/src/middlewares/shieldUserText.test.ts
| Test Case | Type | What is checked |
|-----------|------|-----------------|
| should transform user messages with tags and add system prompt | Positive | Checks if user input is wrapped in unique security tags and a defensive system prompt is prepended to prevent prompt injection. |
| should not transform non-user messages | Positive | Ensures that assistant or other non-user roles are not wrapped in security tags. |
| should not transform non-text content in user message | Boundary | Verifies that security tagging only applies to text content, leaving other types (like images) untouched. |

## packages/llm/src/interviewer/questions.test.ts
| Test Case | Type | What is checked |
|-----------|------|-----------------|
| getFirstQuestion should return generated text | Positive | Confirms that the initial question generation logic correctly extracts and returns text from the LLM output. |
| getNextQuestion should return generated text | Positive | Confirms that subsequent question generation logic correctly extracts and returns text from the LLM output. |

## packages/llm/src/evaluater/evaluateAnswer.test.ts
| Test Case | Type | What is checked |
|-----------|------|-----------------|
| should evaluate a single answer mode | Positive | Verifies that the evaluation logic correctly scores and provides feedback for an individual question-answer pair. |
| should evaluate session mode | Positive | Verifies that the evaluation logic can process an entire conversation history to provide an overall session score. |

## packages/llm/src/summarization/summarize.test.ts
| Test Case | Type | What is checked |
|-----------|------|-----------------|
| should call generateText with correct parameters and return summarization | Positive | Checks if the summarization function correctly passes the conversation history to the LLM and returns the generated summary. |

## packages/llm/src/interviewer/utils.test.ts
| Test Case | Type | What is checked |
|-----------|------|-----------------|
| should generate prompt without summary | Positive | Ensures the prompt template generator works correctly when no previous session summary is available. |
| should generate prompt with summary | Positive | Verifies that the prompt template generator correctly includes the "КРАТКОЕ СОДЕРЖАНИЕ" (Summary) section when provided. |
