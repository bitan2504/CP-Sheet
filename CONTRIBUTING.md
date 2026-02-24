# Contributing Guidelines

Thank you for your interest in contributing to this project.  
To maintain code quality and project consistency, please follow the guidelines below.

---

## 📌 Before You Start

- Check existing issues before creating a new one.
- If the issue doesn’t exist, create one and discuss the proposed change.
- Wait for approval before starting large features.

---

## 🧭 Branching Strategy

- `main` → Stable production-ready code
- `dev` → Ongoing development (if applicable)

Create feature branches using:

- feature/<feature-name>
- bugfix/<issue-name>
- refactor/<module-name>
- docs/<change-name>


Example:
- feature/user-authentication
- bugfix/login-validation

---

## 🛠 Development Rules

- Follow the existing project structure.
- Maintain consistent naming conventions.
- Avoid unnecessary dependencies.
- Write modular and reusable code.
- Keep functions small and focused.
- Add meaningful comments only where needed.

---

## 🧪 Testing

Before submitting a pull request:

- Ensure the project builds successfully.
- Test your changes locally.
- Verify no existing functionality is broken.
- Fix all warnings and errors.

---

## 📝 Commit Message Format

Use conventional commit format:

type(scope): short description


Types:

- feat → New feature
- fix → Bug fix
- refactor → Code improvement
- docs → Documentation changes
- style → Formatting changes
- test → Test-related changes

Example:

- feat(auth): implement JWT authentication
- fix(api): handle null response in user controller

---

## 🔁 Pull Request Guidelines

When submitting a Pull Request:

- Provide a clear title.
- Link the related issue (if any).
- Explain what changes were made.
- Mention breaking changes (if applicable).
- Keep PRs small and focused.

Avoid:
- Large unrelated changes
- Formatting-only PRs without purpose
- Mixing refactor and feature in one PR

---

## 🚫 What Not to Do

- Do not push directly to `main`
- Do not submit unfinished work
- Do not introduce breaking changes without discussion
- Do not reformat the entire codebase

---

## 🤝 Review Process

- Maintainers will review your PR.
- Changes may be requested.
- Once approved, it will be merged.

Constructive feedback is part of the process.

---

## 📜 License Agreement

By contributing, you agree that your contributions will be licensed under the project’s license.

---

We appreciate your contribution and effort. 🚀

