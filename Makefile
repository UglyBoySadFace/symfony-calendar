#================================================
# VARIABLES
#================================
# The name of your primary service, usually the PHP container name
DOCKER_PHP_SERVICE := php
# The name of your Composer executable (often 'composer' inside the container)
COMPOSER_BIN := composer

#================================
# DEFAULT GOAL
#================================
.PHONY: default
default: help

#================================
# CORE DEVELOPMENT COMMANDS
#================================

## install: Install/Update all dependencies and refresh the environment.
.PHONY: install
install: composer-install db-reset

## up: Start the Docker environment in detached mode.
.PHONY: up
up:
	@echo "Starting Docker environment..."
	@docker compose up -d --wait

## down: Stop and remove all containers.
.PHONY: down
down:
	@echo "Stopping and removing Docker containers..."
	@docker compose down --remove-orphans

## logs: View combined logs for all services.
.PHONY: logs
logs:
	@docker compose logs -f

.PHONY: sync-fork
sync-fork:
	@echo "Syncing fork with upstream..."
	@curl -sSL https://raw.githubusercontent.com/coopTilleuls/template-sync/main/template-sync.sh | sh -s -- https://github.com/api-platform/api-platform
	@echo "Fork synced. Please review changes and commit git cherry-pick --continue if necessary."

#================================
# COMPOSER & DEPENDENCY MANAGEMENT
#================================

## composer-install: Install dependencies using the lock file.
.PHONY: composer-install
composer-install:
	@echo "Running Composer install..."
	@docker compose exec $(DOCKER_PHP_SERVICE) $(COMPOSER_BIN) install

## composer-update: Update dependencies and regenerate the lock file.
.PHONY: composer-update
composer-update:
	@echo "Running Composer update (will regenerate lock file)..."
	@docker compose exec $(DOCKER_PHP_SERVICE) $(COMPOSER_BIN) update

## composer-require {package}: Add a new dependency. Usage: make composer-require package=ramsey/uuid
.PHONY: composer-require
composer-require:
	@if [ -z "$(package)" ]; then echo "Usage: make composer-require package=vendor/package"; exit 1; fi
	@echo "Requiring package $(package)..."
	@docker compose exec $(DOCKER_PHP_SERVICE) $(COMPOSER_BIN) require $(package)

#================================
# DOCTRINE & DATABASE
#================================

## db-migrate: Execute pending Doctrine migrations.
.PHONY: db-migrate
db-migrate:
	@echo "Running Doctrine migrations..."
	@docker compose exec $(DOCKER_PHP_SERVICE) bin/console doctrine:migrations:migrate --no-interaction

## db-reset: Drop, create, migrate, and load fixtures (FULL DB RESET).
.PHONY: db-reset
db-reset:
	@echo "Performing FULL database reset..."
	@docker compose exec $(DOCKER_PHP_SERVICE) bin/console doctrine:database:drop --force --if-exists
	@docker compose exec $(DOCKER_PHP_SERVICE) bin/console doctrine:database:create
	@docker compose exec $(DOCKER_PHP_SERVICE) bin/console doctrine:migrations:migrate --no-interaction
	@docker compose exec $(DOCKER_PHP_SERVICE) bin/console doctrine:fixtures:load --no-interaction

#================================
# API PLATFORM & SYMFONY
#================================

## cache-clear: Clear the Symfony cache.
.PHONY: cache-clear
cache-clear:
	@echo "Clearing Symfony cache..."
	@docker compose exec $(DOCKER_PHP_SERVICE) bin/console cache:clear

## test: Run PHPUnit tests.
.PHONY: test
test:
	@echo "Running PHPUnit tests..."
	@docker compose exec $(DOCKER_PHP_SERVICE) bin/phpunit

## lint: Run Symfony linter and basic checks.
.PHONY: lint
lint:
	@echo "Running Symfony linting..."
	@docker compose exec $(DOCKER_PHP_SERVICE) bin/console lint:yaml config
	@docker compose exec $(DOCKER_PHP_SERVICE) bin/console lint:twig templates

#================================
# HELP
#================================

.PHONY: help
help:
	@echo ""
	@echo "Available commands:"
	@grep -E '^[a-zA-Z0-9_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-25s\033[0m %s\n", $$1, $$2}'
