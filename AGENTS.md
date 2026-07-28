<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

<!-- BEGIN:superpowers-agent-rules -->
# Superpowers + Gates

- Before any task, check Superpowers skills (Cursor plugin: `superpowers`). Mandatory workflows, not suggestions.
- Project gates in `docs/gates/` and `docs/PROCESS.md` take precedence for phase approval. Do not start the next Phase without user 「승인」.
- Ship implementation via feature branch + PR (`finishing-a-development-branch`). Do not treat direct long-lived WIP on `main` as done.
- Overlay docs: `docs/superpowers/README.md`
<!-- END:superpowers-agent-rules -->
