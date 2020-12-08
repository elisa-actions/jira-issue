PRE_COMMIT_VERSION=2.9.2

.PHONY: pre-commit
pre-commit:
	wget -O pre-commit.pyz https://github.com/pre-commit/pre-commit/releases/download/v${PRE_COMMIT_VERSION}/pre-commit-${PRE_COMMIT_VERSION}.pyz
	python3 pre-commit.pyz install
	python3 pre-commit.pyz install --hook-type commit-msg
	rm pre-commit.pyz
