.PHONY: test-e2e-demo test-e2e-full test-real-api eval-run eval-baseline eval-compare

test-e2e-demo:
	cd frontend && npx playwright test tests/demo-flow.spec.js

test-e2e-full:
	cd frontend && npx playwright test

test-real-api:
	cd backend && pytest tests/test_real_api.py -v

eval-run:
	cd backend && python3 -m evals.run_evals -v

eval-baseline:
	cd backend && python3 -m evals.run_evals --baseline -v

eval-compare:
	cd backend && python3 -m evals.run_evals --compare -v
