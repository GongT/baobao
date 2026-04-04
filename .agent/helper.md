A helper program can be called by `pnpm run agent-tool <helper-name> <args>`.

it's main entry at `@internal/scripts/src/agent-tools/<helper-name>.ts`.

When user ask you to write a helper program:
- write it's main logic inside `@internal/scripts/src/agent-tools/<helper-name>.ts`
- create or edit shared logic to `@internal/scripts/src/common` if needed
- validate by `tsc -p @internal/scripts/src`

# opencode agent tools

After all done, write a tool define file at `.opencode/tools/<helper-name>.ts` to expose it to opencode agent.

Template is: `../.opencode/tools/check-memory.ts` file.
