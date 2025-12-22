## General development conventions

- **Consistent Project Structure**: Organize files and directories in a predictable, logical structure that team members can navigate easily
- **Clear Documentation**: Maintain up-to-date README files with setup instructions, architecture overview, and contribution guidelines
- **Version Control Best Practices**: Use clear commit messages, feature branches, and meaningful pull/merge requests with descriptions
- **Environment Configuration**: Use environment variables for configuration; never commit secrets or API keys to version control
- **Dependency Management**: Keep dependencies up-to-date and minimal; document why major dependencies are used
- **Code Review Process**: Establish a consistent code review process with clear expectations for reviewers and authors
- **Testing Requirements**: Define what level of testing is required before merging (unit tests, integration tests, etc.)
- **Feature Flags**: Use feature flags for incomplete features rather than long-lived feature branches
- **Changelog Maintenance**: Keep a changelog or release notes to track significant changes and improvements

## Web Project File Organization

```
src/
├── app/           # Next.js App Router pages and API routes
├── components/    # React components (grouped by feature)
├── lib/           # Utility functions, storage helpers, hooks
├── schemas/       # Zod schemas and inferred types
├── server/        # Server-only code (auth, db, services)
└── stores/        # Zustand stores for global state
```

### Directory Guidelines

- **Group by feature**: Components related to a feature live together (e.g., `components/check-in/`)
- **Barrel exports**: Use `index.ts` files to simplify imports from component directories
- **Test co-location**: Test files live in `__tests__/` directories next to the code they test
- **No `/types/` directory**: Types are inferred from Zod schemas in `/schemas/`
