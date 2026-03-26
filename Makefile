.PHONY: test-e2e-demo test-e2e-full test-real-api

test-e2e-demo:
	cd frontend && npx playwright test tests/demo-flow.spec.js

test-e2e-full:
	cd frontend && npx playwright test

test-real-api:
	cd backend && pytest tests/test_real_api.py -v
