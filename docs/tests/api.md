# API Test Cases Analysis

This document provides an overview of the test cases found in `packages/api`.

## packages/api/src/routers/script.test.ts
| Test Case | Type | What is checked |
|-----------|------|-----------------|
| returns a script by id | Positive | Verifies fetching script details and handling non-existent scripts (404). |
| resolves latest scripts and rewrites image links | Positive | Checks retrieval of latest scripts and correct generation of image URLs. |
| lists categories and criteria types | Positive | Verifies listing of available categories and criteria types. |
| lists scenarios with pagination and filters | Positive | Checks scenario listing with pagination (page, limit) and filters (categoryId, search). |
| returns an expert profile with optional category filtering | Positive | Verifies fetching expert details, their categories, and scripts, including 404 handling. |
| maps user history entries to finished timestamps | Positive | Checks transformation of user session history, specifically mapping status logs to finished dates. |
| returns user history by script id | Positive | Verifies fetching user session history filtered by a specific script. |

## packages/api/src/routers/session.extra.test.ts
| Test Case | Type | What is checked |
|-----------|------|-----------------|
| creates a new interview session | Positive | Verifies session creation within a transaction. |
| rejects missing scripts, empty contexts and empty question lists | Negative | Checks validation for script existence, presence of context, and non-empty questions. |
| returns the interview result for a finished session | Positive | Verifies retrieval of session results including experience gained and 404 handling. |
| returns the session script by interview id and rejects missing sessions | Positive/Negative | Verifies script retrieval for a session and 404 for missing sessions. |
| returns the chat history for a session | Positive | Verifies retrieval of all messages for a given session. |
| adds a new answer and generates a follow-up question | Positive | Checks the process of adding a message, triggering LLM evaluation, and getting a next question. |
| finishes a session when the planner decides to stop | Positive | Verifies session termination when the LLM planner decides the interview is done. |
| handles already finished sessions when explicitly finishing or canceling | Boundary | Checks that finish/cancel operations on already terminal sessions are handled gracefully. |

## packages/api/src/routers/report.test.ts
| Test Case | Type | What is checked |
|-----------|------|-----------------|
| returns an existing active report instead of creating a duplicate | Boundary | Verifies idempotency when reporting a script that already has an active report from the same user. |
| rejects reports for missing scripts | Negative | Checks that reports cannot be created for non-existent scripts (404). |
| creates a new report and initial status log | Positive | Verifies creation of a report, its initial status log, and logging. |
| lists the current user's reports | Positive | Checks retrieval of reports created by the authenticated user. |
| filters admin reports by status | Positive | Verifies admin-only ability to list and filter all reports by status and search. |
| returns an empty expert report list when no scripts match | Boundary | Checks that experts see an empty list if no reports exist for their scripts. |
| returns report details for the owner and rejects strangers | Positive/Negative | Verifies report access control (owner/admin only) and 404 for missing reports. |
| changes report status | Positive | Verifies admin-only ability to update report status and handle 404s. |

## packages/api/src/routers/expertSandbox.test.ts
| Test Case | Type | What is checked |
|-----------|------|-----------------|
| creates a sandbox session | Positive | Verifies sandbox creation for experts, including script validation (context/questions). |
| returns sandbox session details | Positive | Checks retrieval of sandbox session state and 404 handling. |
| sends an answer and advances to the next question | Positive | Verifies answer processing and advancing the interview state in sandbox mode. |
| finishes a sandbox session when the planner decides to stop | Positive | Checks sandbox termination logic when the LLM planner decides it's over. |
| rewinds to a previous message | Positive | Verifies the "rewind" functionality to revert a sandbox session to a previous state. |

## packages/api/src/middlewares.test.ts
| Test Case | Type | What is checked |
|-----------|------|-----------------|
| rejects unauthenticated callers | Negative | Verifies `protectedMiddleware` blocks requests without a session. |
| passes the session through | Positive | Verifies `protectedMiddleware` provides session data to the procedure. |
| rejects missing sessions | Negative | Verifies `hasRoleMiddleware` blocks requests without a session. |
| rejects users with the wrong role | Negative | Verifies `hasRoleMiddleware` blocks users with insufficient permissions (403). |
| allows the matching role | Positive | Verifies `hasRoleMiddleware` allows users with the required role. |
| logs successful procedure calls | Positive | Verifies `loggerMiddleware` logs info on success. |
| logs failed procedure calls | Negative | Verifies `loggerMiddleware` logs errors on failure. |
| passes through TRPC errors | Positive | Verifies `errorMiddleware` preserves existing TRPC errors. |
| maps domain errors to TRPC errors | Positive | Checks mapping of custom domain errors to TRPC codes. |
| treats non-rate-limited email delivery errors as internal errors | Negative | Verifies mapping of service failures to INTERNAL_SERVER_ERROR. |
| maps email configuration errors to internal errors | Negative | Verifies mapping of config errors to INTERNAL_SERVER_ERROR. |
| maps generic domain errors to bad requests | Negative | Verifies fallback mapping of domain errors to BAD_REQUEST. |
| maps file and storage errors appropriately | Negative | Verifies mapping of file/storage errors to PAYLOAD_TOO_LARGE/INTERNAL_SERVER_ERROR. |
| uses the session user id when available | Positive | Verifies `globalRateLimitMiddleware` uses userId for tracking. |
| falls back to the client IP, user agent and anonymous identifier | Boundary | Verifies `globalRateLimitMiddleware` rate limiting fallback keys. |
| throws when the limiter rejects a request | Negative | Verifies `llmRateLimitMiddleware` throws TOO_MANY_REQUESTS when limited. |
| re-exports the middlewares | Positive | Structural check of middleware exports. |

## packages/api/src/achievements/metrics.test.ts
| Test Case | Type | What is checked |
|-----------|------|-----------------|
| returns zero when there are no completed sessions | Boundary | Checks streak calculation with no data. |
| counts a streak that starts today and skips duplicate same-day completions | Positive | Verifies streak calculation logic for multiple sessions on the same day. |
| counts a streak that starts yesterday | Positive | Verifies streak continuation from the previous day. |
| returns zero when the latest completed session is too old | Boundary | Verifies streak break when sessions are not consecutive. |
| returns zero when the user does not exist | Negative | Checks achievement sync for non-existent users. |
| awards new achievements and skips invalid formulas | Positive/Boundary | Verifies awarding achievements based on formulas and handling of malformed formulas. |
| processes every user | Positive | Verifies bulk achievement recalculation for all users. |

## packages/api/src/index.test.ts
| Test Case | Type | What is checked |
|-----------|------|-----------------|
| re-exports the init and router modules | Positive | Structural check of package exports. |

## packages/api/src/init/index.test.ts
| Test Case | Type | What is checked |
|-----------|------|-----------------|
| re-exports the init helpers | Positive | Structural check of init module exports. |

## packages/api/src/routers/mutateScript.test.ts
| Test Case | Type | What is checked |
|-----------|------|-----------------|
| publishes a filled draft | Positive | Verifies script publication by owner and permission checks (403). |
| rejects draft publication when the script is missing or incomplete | Negative | Verifies validation for missing scripts (404) or missing required fields. |
| deletes a script | Positive | Verifies script deletion by owner and permission/existence checks. |
| updates first step fields | Positive | Verifies updating basic script metadata. |
| updates second step fields and creates or deletes criteria | Positive | Verifies updating script context and managing associated criteria within a transaction. |
| rejects second step updates for missing or forbidden scripts | Negative | Checks access control and existence validation for second step updates. |
| updates third step questions and marks the draft as published | Positive | Verifies managing questions and their criteria, and handling errors. |

## packages/api/src/init/context.test.ts
| Test Case | Type | What is checked |
|-----------|------|-----------------|
| prefers x-forwarded-for and x-request-id | Positive | Verifies context extraction from standard headers. |
| falls back to x-real-ip and generates a request id | Boundary | Checks fallback logic for IP and ID generation when headers are missing. |

## packages/api/src/init/dependencies.test.ts
| Test Case | Type | What is checked |
|-----------|------|-----------------|
| exposes the shared service clients | Positive | Structural check that default dependencies (auth, db, file, llm) are present. |

## packages/api/src/routers/expert.test.ts
| Test Case | Type | What is checked |
|-----------|------|-----------------|
| returns a full script for its creator | Positive | Verifies that experts can fetch full details of scripts they created. |
| creates a new draft script | Positive | Checks creation of a fresh draft script with logging. |
| returns only the current user's drafts | Positive | Verifies retrieval of draft scripts owned by the expert. |
| returns only the current user's published scripts | Positive | Verifies retrieval of published scripts owned by the expert. |

## packages/api/src/routers/session.test.ts
| Test Case | Type | What is checked |
|-----------|------|-----------------|
| creates a new interview session | Positive | Verifies initial session setup, status log, and first AI message. |
| returns the script for an interview session | Positive | Verifies retrieval of the associated script for a session. |

## packages/api/src/routers/file.test.ts
| Test Case | Type | What is checked |
|-----------|------|-----------------|
| returns a signed upload link for avatar files | Positive | Verifies generation of storage upload links with correct keys and logging. |
| uses the last extension segment when building the storage key | Boundary | Checks extension extraction logic for complex filenames. |

## packages/api/src/routers/category.test.ts
| Test Case | Type | What is checked |
|-----------|------|-----------------|
| returns active categories | Positive | Verifies listing of non-deleted categories. |
| creates a category | Positive | Verifies admin creation of a category. |
| updates a category by id | Positive | Verifies admin update of a category. |
| deletes a category by id | Positive | Verifies admin soft-deletion of a category. |

## packages/api/src/routers/achievement.test.ts
| Test Case | Type | What is checked |
|-----------|------|-----------------|
| lists achievements with awarded counts | Positive | Verifies listing of all achievements including awarding statistics. |
| creates an achievement after validating the formula | Positive | Checks achievement creation with formula validation and immediate sync. |
| updates an achievement by id | Positive | Checks achievement updates with validation and sync. |
| recalculates achievements for all users | Positive | Verifies triggering of full achievement recalculation. |

## packages/api/src/routers/expertManager.test.ts
| Test Case | Type | What is checked |
|-----------|------|-----------------|
| lists expert users | Positive | Verifies admin retrieval of all users with the 'expert' role. |
| promotes a user to expert | Positive | Verifies admin promotion of a user by email. |
| demotes an expert to a regular user | Positive | Verifies admin demotion of an expert by ID. |

## packages/api/src/routers/index.test.ts
| Test Case | Type | What is checked |
|-----------|------|-----------------|
| returns OK | Positive | Verifies healthCheck procedure. |

## packages/api/src/routers/profile.test.ts
| Test Case | Type | What is checked |
|-----------|------|-----------------|
| returns the current profile | Positive | Verifies retrieval of own user profile data. |
| returns profile stats | Positive | Checks retrieval of XP, interview counts, and achievement counts. |
| maps history sessions to finished timestamps | Positive | Verifies transformation of own session history logs. |
| returns achievements in descending award order | Positive | Checks retrieval of user-earned achievements. |

## packages/api/src/routers/user.test.ts
| Test Case | Type | What is checked |
|-----------|------|-----------------|
| returns basic user stats | Positive | Verifies retrieval of XP and name for stats display. |
| delegates streak calculation to the metrics helper | Positive | Verifies that user streak info is correctly calculated using internal metrics. |

## packages/api/src/routers/activity.test.ts
| Test Case | Type | What is checked |
|-----------|------|-----------------|
| returns the three newest finished sessions | Positive | Verifies retrieval of the 3 most recent non-active sessions. |

## packages/api/src/achievements/formula.test.ts
| Test Case | Type | What is checked |
|-----------|------|-----------------|
| evaluates boolean expressions | Positive | Verifies evaluation of complex logic in formulas. |
| supports arithmetic and parenthesis | Positive | Verifies math support in formulas. |
| rejects unknown variables | Negative | Checks validation of formula variables. |

## packages/api/src/routers/sessionExperience.test.ts
| Test Case | Type | What is checked |
|-----------|------|-----------------|
| returns 0 when there is no score | Boundary | Verifies XP calculation for non-scored sessions. |
| returns the score as XP for a completed interview | Positive | Verifies 1:1 mapping of score to XP. |
| never returns a negative value | Boundary | Ensures XP is never negative. |
