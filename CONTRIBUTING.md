# Contributing to Aether Sentinel

Thank you for your interest in contributing. This project is currently maintained as a personal portfolio and research system.

## Getting Started

1. Fork the repository
2. Run `make install` to set up the development environment
3. Run `make test` to verify everything works
4. Create a feature branch: `git checkout -b feature/your-change`

## Development Workflow

- Follow the existing code style (enforced by Ruff and ESLint)
- Add tests for new backend functionality
- Ensure `make test` passes before submitting
- Ensure `pnpm --dir apps/web build` passes for frontend changes
- Update documentation for architectural changes

## Pull Request Process

1. Update the README and docs if needed
2. Update the CHANGELOG
3. Ensure CI passes on your branch
4. Request review from the maintainer

## Code of Conduct

Be respectful, constructive, and focused on improving the system's reliability and clarity.
