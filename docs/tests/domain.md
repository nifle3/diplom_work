# Domain Tests

## index.test.ts
| Test Case | Type | What is checked |
|-----------|------|-----------------|
| re-exports the public API | Positive | Verifies that the domain package correctly exports all intended errors, constants, and utilities from its entry point. |

## error/email.test.ts
| Test Case | Type | What is checked |
|-----------|------|-----------------|
| EmailConfigurationError: sets the class name and preserves the payload | Positive | Verifies that `EmailConfigurationError` correctly initializes with name, message, and configuration payload. |
| EmailDeliveryError: sets the class name and preserves optional payload fields | Positive | Verifies that `EmailDeliveryError` correctly initializes and preserves all fields in its error payload, including optional ones. |

## values/sessionStatus.test.ts
| Test Case | Type | What is checked |
|-----------|------|-----------------|
| Status: exposes the expected enum values | Positive | Verifies that the `Status` enum contains the required values: active, complete, and canceled. |
| statusToId: maps every status to its identifier | Positive | Verifies the mapping of status string values to their corresponding numeric database identifiers. |

## values/reportStatus.test.ts
| Test Case | Type | What is checked |
|-----------|------|-----------------|
| reportStatuses: exposes the expected allowed statuses | Positive | Verifies that the `reportStatuses` array contains the correct set of allowed status strings (new, in_review, resolved, rejected). |

## error/storage.test.ts
| Test Case | Type | What is checked |
|-----------|------|-----------------|
| StorageError: sets the class name and payload | Positive | Verifies that `StorageError` correctly initializes with name, message, and storage-specific context payload. |

## error/fileTooLarge.test.ts
| Test Case | Type | What is checked |
|-----------|------|-----------------|
| FileTooLargeError: sets the class name and payload | Positive | Verifies that `FileTooLargeError` correctly initializes and stores the limit information in its payload. |

## error/base.test.ts
| Test Case | Type | What is checked |
|-----------|------|-----------------|
| DomainError: keeps the message, payload, and prototype chain | Positive | Verifies the base `DomainError` class correctly handles message and payload while maintaining the proper JavaScript prototype chain. |
