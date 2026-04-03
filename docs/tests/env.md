# Env Tests

## server.test.ts
| Test Case | Type | What is checked |
|-----------|------|-----------------|
| should load and validate correct environment variables | Positive | Verifies that the server environment configuration correctly loads and validates a full set of valid environment variables. |
| should use default values | Positive | Verifies that optional environment variables fall back to their default values (e.g., `DATABASE_PROVIDER`, `AI_TEMPERATURE`, `RATE_LIMIT_ENABLE`). |
| should throw "Invalid environment variables" when required variables are missing | Negative | Verifies that the configuration validation fails if mandatory environment variables are not provided. |
| should throw "Invalid environment variables" if BETTER_AUTH_SECRET is too short | Boundary | Verifies that the `BETTER_AUTH_SECRET` must meet a minimum length requirement. |
| should accept DATABASE_PROVIDER = neon | Positive | Verifies that 'neon' is a valid value for the `DATABASE_PROVIDER` environment variable. |
| should coerce AI_TEMPERATURE from string to number | Positive | Verifies that the `AI_TEMPERATURE` string value from the environment is correctly converted to a numeric type. |
