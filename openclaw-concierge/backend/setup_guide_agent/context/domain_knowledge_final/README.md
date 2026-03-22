# Domain Knowledge

Two-tier knowledge base of 70 OpenClaw use cases, industry applications, and tutorials.

## Structure

- **summaries/** — Quick-reference summaries. Each file contains: industry, target persona, execution story, tools & integrations, setup notes & warnings, source type, and source link. Use these for fast lookups and matching user needs to relevant use cases.

- **references/** — Deep-dive raw content fetched from each summary's source URL. Full article text with YAML frontmatter (Source, Title, Author, Date, Type). Use these when the agent needs detailed implementation specifics, exact workflows, or verbatim instructions from the original source.

Files marked `Status: unfetchable` in references/ could not be retrieved (blocked platforms like Reddit/YouTube/Facebook, expired domains, or 404s). Cross-reference files point to a primary reference when multiple summaries share the same source URL.

## How the Agent Uses This

1. Match the user's industry/use case to relevant **summaries** for context and recommendations
2. Pull from **references** when generating detailed setup guides that need specific implementation details
3. Cite sources from the `**Link:**` field when recommending approaches to users
