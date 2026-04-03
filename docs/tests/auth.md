# Auth Tests

## email.test.ts
| Test Case | Type | What is checked |
|-----------|------|-----------------|
| should send a password reset email correctly | Positive | Verifies that the `sendPasswordReset` function is called with the correct email and URL, and no error is logged. |
| should log an error when EmailDeliveryError is thrown | Negative | Verifies that a specific `EmailDeliveryError` triggers an error log with the correct context. |
| should not log an error for other types of errors | Negative | Verifies that generic errors during email sending are not logged by the specific error handler. |

## utils.test.ts
| Test Case | Type | What is checked |
|-----------|------|-----------------|
| should return a valid UUID string | Positive | Verifies that `generateId` returns a string matching the UUID v4 format. |
| should generate unique IDs | Positive | Verifies that consecutive calls to `generateId` produce different identifiers. |

## logger.test.ts
| Test Case | Type | What is checked |
|-----------|------|-----------------|
| should bridge log calls to the internal logger correctly | Positive | Verifies that the logger bridge correctly maps log levels (info, error, warn, debug) and formats messages for the internal logger. |

## session.test.ts
| Test Case | Type | What is checked |
|-----------|------|-----------------|
| should enrich the session with the user's role | Positive | Verifies that the session hook fetches the user's role from the database and adds it to the session object. |
| should handle cases where the user or role is not found | Negative | Verifies that the session hook gracefully handles missing users by setting the role to undefined. |
