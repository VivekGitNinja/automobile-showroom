# Job Retry & Backoff Strategy

Max 5 retries with exponential backoff (2s, 4s, 8s, 16s, 32s) before dead-letter queue routing.
