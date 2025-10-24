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

.PHONY: install
install: composer-install db-reset ## Install/Update all dependencies and refresh the environment.

.PHONY: up
up: ## Start the Docker environment in detached mode.
	@echo "Starting Docker environment..."
	@docker compose up -d

.PHONY: down
down: ## Stop and remove all containers.
	@echo "Stopping and removing Docker containers..."
	@docker compose down --remove-orphans

.PHONY: logs
logs: ## View combined logs for all services.
	@docker compose logs -f

#================================
# COMPOSER & DEPENDENCY MANAGEMENT
#================================

.PHONY: composer-install
composer-install: ## Install dependencies using the lock file.
	@echo "Running Composer install..."
	@docker compose exec $(DOCKER_PHP_SERVICE) $(COMPOSER_BIN) install

.PHONY: composer-update
composer-update: ## Update dependencies and regenerate the lock file.
	@echo "Running Composer update (will regenerate lock file)..."
	@docker compose exec $(DOCKER_PHP_SERVICE) $(COMPOSER_BIN) update

.PHONY: composer-require
composer-require: ## Add a new dependency. Usage: make composer-require package=ramsey/uuid
	@if [ -z "$(package)" ]; then echo "Usage: make composer-require package=vendor/package"; exit 1; fi
	@echo "Requiring package $(package)..."
	@docker compose exec $(DOCKER_PHP_SERVICE) $(COMPOSER_BIN) require $(package)

#================================
# DOCTRINE & DATABASE
#================================

.PHONY: db-migrate
db-migrate: ## Execute pending Doctrine migrations.
	@echo "Running Doctrine migrations..."
	@docker compose exec $(DOCKER_PHP_SERVICE) bin/console doctrine:migrations:migrate --no-interaction

.PHONY: db-reset
db-reset: ## Drop, create, migrate, and load fixtures (FULL DB RESET).
	@echo "Performing FULL database reset..."
	@docker compose exec $(DOCKER_PHP_SERVICE) bin/console doctrine:database:drop --force --if-exists
	@docker compose exec $(DOCKER_PHP_SERVICE) bin/console doctrine:database:create
	@docker compose exec $(DOCKER_PHP_SERVICE) bin/console doctrine:migrations:migrate --no-interaction
	@docker compose exec $(DOCKER_PHP_SERVICE) bin/console doctrine:fixtures:load --no-interaction

#================================
# API PLATFORM & SYMFONY
#================================

.PHONY: cache-clear
cache-clear: ## Clear the Symfony cache.
	@echo "Clearing Symfony cache..."
	@docker compose exec $(DOCKER_PHP_SERVICE) bin/console cache:clear

.PHONY: test
test: ## Run PHPUnit tests.
	@echo "Running PHPUnit tests..."
	@docker compose exec $(DOCKER_PHP_SERVICE) bin/phpunit

.PHONY: lint
lint: ## Run Symfony linter and basic checks.
	@echo "Running Symfony linting..."
	@docker compose exec $(DOCKER_PHP_SERVICE) bin/console lint:yaml config
	@docker compose exec $(DOCKER_PHP_SERVICE) bin/console lint:twig templates

#================================
# HELP
#================================

.PHONY: help
help: ## Show this help message.
	@echo ""
	@echo "Available commands:"
	@grep -E '^[a-zA-Z0-9_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-25s\033[0m %s\n", $$1, $$2}'
