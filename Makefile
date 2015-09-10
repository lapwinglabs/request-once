lint:
	@./node_modules/.bin/standard | ./node_modules/.bin/snazzy

test:
	@NODE_PATH=lib ./node_modules/.bin/mocha

.PHONY: lint test