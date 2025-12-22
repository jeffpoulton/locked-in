## State management best practices

- **Minimal Global State**: Keep global state to a minimum; prefer local component state when possible
- **Single Source of Truth**: Each piece of state should have one authoritative source
- **Immutable Updates**: Always create new state objects rather than mutating existing ones
- **Derived State**: Compute derived values on-the-fly rather than storing redundant state
- **Persistence Strategy**: Be intentional about what state persists (localStorage, URL, server) vs. ephemeral state

## Zustand for Global State

Use Zustand for state that needs to be shared across components, persisted, or accessed outside React.

### Basic Pattern

```typescript
import { create } from "zustand";

interface MyState {
  // State
  value: string;
  items: Item[];
  
  // Actions
  setValue: (value: string) => void;
  addItem: (item: Item) => void;
  reset: () => void;
}

const initialState = {
  value: "",
  items: [],
};

export const useMyStore = create<MyState>((set, get) => ({
  ...initialState,

  setValue: (value) => set({ value }),
  
  addItem: (item) => set((state) => ({ 
    items: [...state.items, item] 
  })),
  
  reset: () => set(initialState),
}));
```

### When to Use Zustand vs. useState

| Use `useState` | Use Zustand |
|----------------|-------------|
| UI-only state (open/closed, hover) | Shared across multiple components |
| Form input values | Needs persistence (localStorage) |
| Component-local data | Accessed outside React (utilities) |
| Animation state | Complex state with many actions |

### Accessing State Outside React

Zustand stores can be accessed outside React components:

```typescript
// In a utility function
import { useMyStore } from "@/stores/my-store";

export function doSomething() {
  const { value, setValue } = useMyStore.getState();
  // Use state directly
}
```

### Store Organization

- One store per domain/feature (e.g., `check-in-store.ts`, `contract-wizard-store.ts`)
- Keep stores focused - split large stores into smaller ones
- Co-locate store tests in `__tests__/` directory

