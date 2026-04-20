# /opsx

Workspace entrypoint for this repo's OpenSpec workflow.

## Arguments

- `mode`: `explore`, `propose`, `apply`, or `archive`
- `request`: optional problem statement, feature description, or change name

## Workflow

1. If `mode` is missing or ambiguous, ask which workflow the user wants.
2. Route to the matching workspace skill:
   - `explore` -> `openspec-explore`
   - `propose` -> `openspec-propose`
   - `apply` -> `openspec-apply-change`
   - `archive` -> `openspec-archive-change`
3. Treat `request` as the skill input.
4. Respect the repo's existing `openspec/` artifacts and active changes.
5. For `explore`, do not implement application code unless the user explicitly switches to `propose` or `apply`.

## Examples

- `/opsx mode:explore request:"Should channel browsing support search filters?"`
- `/opsx mode:propose request:"add keyboard shortcuts for player controls"`
- `/opsx mode:apply request:"back-to-channel"`
- `/opsx mode:archive request:"back-to-channel"`

## Notes

- This command is the Codex-native equivalent of the repo's Claude-only `.claude/commands/opsx/*` setup.
- If argument syntax is inconvenient in your client, plain language is acceptable after `/opsx`.
