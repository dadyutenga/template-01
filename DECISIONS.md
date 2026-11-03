# Decisions

- The supplied directory was not a Git repository. Initialized `template-conversion` and committed a baseline so subsequent changes can be reviewed; no previous history was available to preserve.
- The actual source is an education and file-sharing application rather than the described point-of-sale application. Classification follows the source that is present.
- Excluded `.env.backup` and ignored `.env` from the baseline commit because environment files may contain credentials. They remain in the workspace untouched.
- The initial inventory is provisional. Domain-specific files may contain reusable patterns, so no deletion should occur until those patterns have been reviewed and extracted.
