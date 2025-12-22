## Validation best practices

- **Validate on Server Side**: Always validate on the server; never trust client-side validation alone for security or data integrity
- **Client-Side for UX**: Use client-side validation to provide immediate user feedback, but duplicate checks server-side
- **Fail Early**: Validate input as early as possible and reject invalid data before processing
- **Specific Error Messages**: Provide clear, field-specific error messages that help users correct their input
- **Allowlists Over Blocklists**: When possible, define what is allowed rather than trying to block everything that's not
- **Type and Format Validation**: Check data types, formats, ranges, and required fields systematically
- **Sanitize Input**: Sanitize user input to prevent injection attacks (SQL, XSS, command injection)
- **Business Rule Validation**: Validate business rules (e.g., sufficient balance, valid dates) at the appropriate application layer
- **Consistent Validation**: Apply validation consistently across all entry points (web forms, API endpoints, background jobs)

## Schema-First Types with Zod

Use Zod schemas as the single source of truth for data types. Define schemas first, then infer TypeScript types from them.

### Why Zod?

1. **Runtime validation** - Catches invalid data at runtime, not just compile time
2. **Single source of truth** - Types stay in sync with validation logic
3. **Untrusted data** - localStorage, API responses, and user input must be validated

### Pattern: Define Schema, Infer Type

```typescript
// CORRECT - Define schema, infer type
import { z } from "zod";

export const userSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  createdAt: z.string().datetime(),
});

export type User = z.infer<typeof userSchema>;
```

```typescript
// INCORRECT - Plain TypeScript interface without validation
interface User {
  id: string;
  email: string;
  createdAt: string;
}
```

### Validating Untrusted Data

Always parse data from external sources (localStorage, APIs, user input) through Zod schemas:

```typescript
// CORRECT - Validate with safeParse
export function loadData(): MyData | null {
  const raw = localStorage.getItem("key");
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw);
    const result = myDataSchema.safeParse(parsed);
    return result.success ? result.data : null;
  } catch {
    return null;
  }
}
```

```typescript
// INCORRECT - Type casting without validation
export function loadData(): MyData | null {
  const raw = localStorage.getItem("key");
  return raw ? JSON.parse(raw) as MyData : null;
}
```

### No Separate `/types/` Directory

Do not create a `/types/` directory for plain TypeScript interfaces. All types should be:

1. Inferred from Zod schemas in `/schemas/`
2. Co-located with components if component-specific
3. Exported from the schema file

This prevents type definitions from drifting out of sync with validation logic.
