# Minimal & Efficient Coding

## Core Principle

Write the **minimum amount of code required to solve the problem correctly, efficiently, and maintainably**.

Do not optimize for the fewest characters. Optimize for:

1. Correctness
2. Simplicity
3. Performance
4. Maintainability
5. Reusability when actually needed

Avoid unnecessary complexity.

---

## Rules

### 1. Minimal Code

Only write code that is necessary for the requested feature.

Do NOT:

* Add unnecessary abstractions
* Create unnecessary helper functions
* Create unnecessary files
* Add unused imports
* Add unused variables
* Add unnecessary configuration
* Add unnecessary dependencies
* Add speculative features
* Add code for hypothetical future requirements

If 10 lines solve the problem cleanly, don't write 50.

---

### 2. Prefer Existing Code

Before creating something new:

* Search for an existing component
* Search for an existing utility
* Search for existing hooks
* Search for existing types
* Search for existing API functions
* Search for existing constants
* Search for existing validation

Reuse existing code when it is appropriate.

Do not duplicate functionality.

---

### 3. Avoid Over-Engineering

Do not introduce:

* Design patterns without a real need
* Complex state management for simple state
* Generic abstractions used only once
* Deep component hierarchies
* Excessive interfaces/types
* Unnecessary factories
* Unnecessary classes
* Unnecessary custom hooks
* Premature optimization

Prefer:

```ts
const value = calculateValue(data)
```

over creating multiple abstraction layers for a calculation used once.

---

### 4. Don't Repeat Yourself — But Don't Over-Abstract

Avoid obvious duplication.

However, do not extract code into a reusable abstraction simply because two pieces of code look similar.

Extract when:

* It is reused multiple times
* It represents a meaningful domain concept
* It significantly improves readability
* It prevents difficult-to-maintain duplication

---

### 5. Performance

Write efficient code without sacrificing readability.

Prefer:

* Appropriate data structures
* Avoiding unnecessary renders
* Avoiding unnecessary API requests
* Avoiding unnecessary loops
* Server-side operations when appropriate
* Existing framework optimizations

Do NOT add performance optimizations without a reason.

Avoid premature optimization.

---

### 6. React / Next.js

Prefer simple React patterns.

Do not create a custom hook when normal component logic is sufficient.

Do not use global state when local state is sufficient.

Do not use `useEffect` when the logic can be handled by:

* Server Components
* Event handlers
* Derived values
* React Query
* Framework APIs

Keep components focused.

Avoid deeply nested components unless they improve the architecture.

---

### 7. TypeScript

Use TypeScript properly but keep types simple.

Prefer:

```ts
type User = {
  id: string
  name: string
}
```

instead of creating unnecessary generic type systems.

Do not use:

```ts
any
```

unless there is a legitimate reason.

Avoid duplicating types that already exist.

---

### 8. Error Handling

Handle errors that can realistically occur.

Do not add excessive defensive code for impossible or framework-guaranteed states.

Good:

```ts
if (!user) {
  return null
}
```

Avoid unnecessary layers of validation when the data has already been validated upstream.

---

### 9. Comments

Code should explain itself whenever possible.

Do not add comments like:

```ts
// Set the user
setUser(user)
```

Only comment when explaining:

* Why something is done
* A non-obvious business rule
* A workaround
* A complex algorithm
* A framework limitation

---

### 10. Dependencies

Do not install a package when the functionality can reasonably be implemented using:

* Existing project dependencies
* Native browser APIs
* Node.js APIs
* Framework APIs

Before adding a dependency, check whether the project already has an equivalent solution.

---

### 11. File Creation

Do not create a new file unless it provides a meaningful architectural benefit.

Prefer modifying an existing appropriate file when the change is small and logically belongs there.

Create a new file when:

* The existing file is becoming too large
* The code represents a reusable module
* The project architecture expects separation
* The new functionality is independently meaningful

---

### 12. Refactoring

When implementing a feature:

**Do not refactor unrelated code.**

Only refactor existing code when:

* The requested feature requires it
* The existing code prevents a clean implementation
* The refactor is small and clearly improves the affected code

Avoid turning a small feature request into a large rewrite.

---

## Before Writing Code

Quickly determine:

1. What is the simplest solution?
2. Does the project already have something that solves part of this?
3. Can the existing architecture support the change?
4. What is the minimum number of files that need modification?
5. Are there unnecessary abstractions being introduced?

---

## After Writing Code

Check:

* Is every line necessary?
* Are there unused imports?
* Are there unnecessary abstractions?
* Did I duplicate existing functionality?
* Did I introduce unnecessary dependencies?
* Did I modify unrelated code?
* Is there a simpler implementation?
* Is the implementation still maintainable?

If the answer is yes, simplify it.

---

## Priority

When choosing between solutions:

**Simple + Correct > Clever + Complex**

**Existing solution > New abstraction**

**Readable code > Extremely short code**

**Necessary optimization > Premature optimization**

**Small focused change > Large refactor**

---

## Final Rule

Always ask:

> "What is the simplest implementation that is production-ready?"

Then implement that solution and stop.

Do not add complexity unless the requirements justify it.
