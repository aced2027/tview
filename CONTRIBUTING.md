# Contributing to Trading Terminal

Thank you for your interest in contributing! This document provides guidelines for contributing to the project.

## Getting Started

1. Fork the repository
2. Clone your fork: `git clone https://github.com/your-username/trading-terminal.git`
3. Install dependencies: `npm install`
4. Create a branch: `git checkout -b feature/your-feature-name`

## Development Workflow

### Running the Application

```bash
npm run dev          # Start both client and server
npm run dev:client   # Start client only
npm run dev:server   # Start server only
```

### Running Tests

```bash
npm run test         # Run all tests
npm run test:watch   # Run tests in watch mode
```

### Code Style

- Use TypeScript strict mode
- Follow existing code patterns
- Use functional components (React)
- Prefer const over let
- Use meaningful variable names
- Add comments for complex logic

### Commit Messages

Follow conventional commits:

```
feat: add new indicator (RSI)
fix: resolve WebSocket reconnection issue
docs: update README with deployment instructions
test: add tests for tick aggregation
refactor: simplify chart rendering logic
perf: optimize candle data loading
```

## Project Structure

```
trading-terminal/
├── apps/
│   ├── client/              # React frontend
│   │   ├── src/
│   │   │   ├── components/  # UI components
│   │   │   ├── stores/      # Zustand state
│   │   │   ├── hooks/       # Custom hooks
│   │   │   ├── services/    # API & WebSocket
│   │   │   ├── utils/       # Helpers
│   │   │   └── types/       # TypeScript types
│   │   └── package.json
│   └── server/              # Express backend
│       ├── src/
│       │   ├── routes/      # REST endpoints
│       │   ├── services/    # Business logic
│       │   ├── websocket/   # WebSocket handler
│       │   └── types/       # TypeScript types
│       └── package.json
└── package.json             # Monorepo root
```

## Adding New Features

### Adding a New Indicator

1. Add calculation function to `apps/client/src/utils/indicators.ts`
2. Add tests to `apps/client/src/utils/indicators.test.ts`
3. Update `IndicatorPanel.tsx` to include the new indicator
4. Add to `useIndicators` hook if needed

Example:
```typescript
export function calculateATR(candles: Candle[], period: number = 14): number[] {
  // Implementation
}
```

### Adding a New Chart Type

1. Update `ChartType` in `apps/client/src/types/index.ts`
2. Add rendering logic in `ChartContainer.tsx`
3. Update `ChartToolbar.tsx` to include the new type

### Adding a New API Endpoint

1. Create route file in `apps/server/src/routes/`
2. Register route in `apps/server/src/index.ts`
3. Add corresponding API call in `apps/client/src/services/api.ts`
4. Update types in both client and server

## Testing Guidelines

### Unit Tests

- Test pure functions (indicators, aggregators, formatters)
- Mock external dependencies
- Aim for >80% coverage on critical paths

### Component Tests

- Test rendering
- Test user interactions
- Test error states
- Test loading states

### Integration Tests

- Test API endpoints
- Test WebSocket communication
- Test data flow

## Pull Request Process

1. Update documentation if needed
2. Add tests for new features
3. Ensure all tests pass: `npm run test`
4. Update FEATURES.md if adding new features
5. Create a pull request with a clear description

### PR Checklist

- [ ] Code follows project style
- [ ] Tests added/updated
- [ ] Documentation updated
- [ ] No console.log statements
- [ ] No TypeScript errors
- [ ] All tests pass
- [ ] Commit messages follow convention

## Code Review

- Be respectful and constructive
- Focus on code quality and maintainability
- Suggest improvements, don't demand changes
- Approve when satisfied

## Bug Reports

When reporting bugs, include:

1. Description of the issue
2. Steps to reproduce
3. Expected behavior
4. Actual behavior
5. Screenshots (if applicable)
6. Environment (OS, browser, Node version)

## Feature Requests

When requesting features:

1. Describe the feature
2. Explain the use case
3. Provide examples if possible
4. Consider implementation complexity

## Questions?

- Open an issue for questions
- Check existing issues first
- Be specific and provide context

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

## Thank You!

Your contributions make this project better for everyone. Thank you for taking the time to contribute!
