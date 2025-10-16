# Contributing to AI Agent Schema

Thank you for your interest in contributing to the AI Agent Schema project! 🎉

## Getting Started

1. **Fork the repository** and clone your fork:
   ```bash
   git clone https://github.com/yourusername/ai-agent-schema.git
   cd ai-agent-schema
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Create a branch** for your changes:
   ```bash
   git checkout -b feature/your-feature-name
   ```

## Development Workflow

### Running Tests

```bash
# Run tests in watch mode
npm test

# Run tests once
npm test -- --run

# Run tests with coverage
npm run test:coverage

# Run tests with UI
npm run test:ui
```

### Building

```bash
# Build the project
npm run build

# Build in watch mode
npm run dev
```

### Linting and Formatting

```bash
# Check for linting issues
npm run lint

# Auto-fix linting issues
npm run lint:fix

# Check formatting
npm run format:check

# Auto-format code
npm run format

# Type check
npm run typecheck
```

### Full Verification

```bash
# Run all checks (build, lint, test, verify)
npm run verify
```

## Project Structure

```
src/
├── types/           # TypeScript type definitions
├── schemas/         # Zod validation schemas
├── utils/           # Utility functions (validators, generators)
├── adapters/        # Framework adapters (Phase 2+)
└── index.ts         # Main export file

tests/               # Test files (mirror src structure)
examples/            # Usage examples
docs/                # Documentation
```

## Coding Guidelines

### TypeScript

- Use strict TypeScript (`strict: true`)
- Prefer explicit types over `any`
- Use interfaces for public APIs
- Use types for unions and intersections

### Code Style

- Follow the ESLint and Prettier configurations
- Use meaningful variable and function names
- Add JSDoc comments for public APIs
- Keep functions small and focused

### Testing

- Write tests for all new features
- Aim for high test coverage
- Use descriptive test names
- Test both success and error cases

### Commits

- Use conventional commit messages:
  - `feat:` for new features
  - `fix:` for bug fixes
  - `docs:` for documentation changes
  - `test:` for test changes
  - `chore:` for maintenance tasks

Example:
```bash
git commit -m "feat: add support for custom provider configurations"
git commit -m "fix: handle undefined parameters in validator"
git commit -m "docs: update API reference for AgentConfig"
```

## Adding New Features

### Adding a New Provider

1. Add the provider to `AIProviderSchema` in `src/schemas/agent.schema.ts`
2. Update the type in `src/types/agent.ts`
3. Add tests for the new provider
4. Update documentation

### Adding New Configuration Options

1. Add the field to the appropriate interface in `src/types/agent.ts`
2. Add validation in the corresponding Zod schema
3. Add tests for the new field
4. Update documentation and examples

### Adding Framework Adapters (Phase 2)

1. Create a new file in `src/adapters/`
2. Implement the adapter function
3. Export it from `src/index.ts`
4. Add comprehensive tests
5. Add usage examples
6. Update README

## Testing Your Changes

Before submitting a PR:

1. **Run all tests**: `npm test -- --run`
2. **Check linting**: `npm run lint`
3. **Build the project**: `npm run build`
4. **Run verification**: `npm run verify`

All checks should pass!

## Submitting a Pull Request

1. Push your changes to your fork:
   ```bash
   git push origin feature/your-feature-name
   ```

2. Open a Pull Request on GitHub

3. Fill out the PR template with:
   - Description of changes
   - Related issue numbers
   - Testing performed
   - Breaking changes (if any)

4. Wait for review and address any feedback

## Code Review Process

- All PRs require at least one review
- CI checks must pass
- Code must follow style guidelines
- Tests must be included for new features
- Documentation must be updated

## Questions or Issues?

- Open an [issue](https://github.com/yourusername/ai-agent-schema/issues) for bugs
- Start a [discussion](https://github.com/yourusername/ai-agent-schema/discussions) for questions
- Join our community chat (coming soon!)

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

## Recognition

Contributors will be recognized in:
- The project README
- Release notes
- Contributors page

Thank you for helping make AI Agent Schema better! 🚀
