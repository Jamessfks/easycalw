# Tools and Plugins

OpenClaw provides a three-layer extensibility system: tools, skills, and plugins.

## Three Layers

### 1. Tools

Tools are individual functions that agents can call during a conversation. They are the atomic unit of extensibility.

Examples: `file_read`, `shell_exec`, `web_search`, `image_generate`

### 2. Skills

Skills are curated sets of tools bundled together for a specific capability. A skill may include multiple tools, prompts, and configuration.

Examples: `coding` (file_read + file_write + shell_exec), `research` (web_search + summarize + cite)

### 3. Plugins

Plugins are installable packages that provide tools, skills, channel integrations, or other extensions. They can be first-party or community-developed.

Examples: `@openclaw/github`, `@openclaw/calendar`, `@openclaw/jira`

## Built-in Tools

These tools are available out of the box without any plugins:

| Tool | Description | Category |
|------|-------------|----------|
| `file_read` | Read file contents | File System |
| `file_write` | Write or create files | File System |
| `file_list` | List directory contents | File System |
| `file_search` | Search for files by pattern | File System |
| `shell_exec` | Execute shell commands | System |
| `web_search` | Search the web | Web |
| `web_fetch` | Fetch a URL and extract content | Web |
| `image_generate` | Generate images via DALL-E or similar | Media |
| `image_analyze` | Analyze image contents | Media |
| `audio_transcribe` | Transcribe audio to text | Media |
| `code_interpret` | Run code in a sandboxed interpreter | Code |
| `memory_store` | Store key-value pairs in session memory | Memory |
| `memory_recall` | Retrieve stored memory values | Memory |
| `calculator` | Evaluate mathematical expressions | Utility |
| `datetime` | Get current date/time and timezone info | Utility |
| `json_parse` | Parse and query JSON data | Utility |
| `regex_match` | Test and extract regex matches | Utility |

## Plugin-Provided Tools

Install plugins to add more tools:

```bash
# Install a plugin
openclaw plugin install @openclaw/github

# List installed plugins
openclaw plugin list

# Update plugins
openclaw plugin update --all
```

Popular plugins and their tools:

| Plugin | Tools Provided |
|--------|---------------|
| `@openclaw/github` | `github_issue_create`, `github_pr_create`, `github_repo_search`, `github_file_read` |
| `@openclaw/calendar` | `calendar_list_events`, `calendar_create_event`, `calendar_update_event` |
| `@openclaw/jira` | `jira_issue_create`, `jira_issue_search`, `jira_board_view` |
| `@openclaw/notion` | `notion_page_create`, `notion_database_query`, `notion_page_update` |
| `@openclaw/slack` | `slack_send_message`, `slack_channel_list`, `slack_thread_reply` |
| `@openclaw/email` | `email_send`, `email_search`, `email_read` |
| `@openclaw/weather` | `weather_current`, `weather_forecast` |

## Tool Configuration

### Allow/Deny Lists

Control which tools agents can use:

```yaml
tools:
  allow:
    - file_read
    - file_write
    - web_search
    - shell_exec
  deny:
    - system_shutdown
    - file_delete
```

If `allow` is specified, only listed tools are available (whitelist mode). If only `deny` is specified, all tools except listed ones are available (blacklist mode).

### Profiles

Define reusable tool profiles for different contexts:

| Profile | Description | Tools Included |
|---------|-------------|---------------|
| `safe` | Read-only, no system access | `file_read`, `web_search`, `calculator`, `datetime` |
| `standard` | Common tools for general use | `file_read`, `file_write`, `web_search`, `shell_exec`, `memory_store`, `memory_recall` |
| `full` | All tools enabled | All built-in + plugin tools |
| `code` | Optimized for coding tasks | `file_read`, `file_write`, `shell_exec`, `code_interpret`, `file_search` |
| `research` | Optimized for research tasks | `web_search`, `web_fetch`, `file_write`, `memory_store`, `memory_recall` |

Use profiles in config:

```yaml
tools:
  profile: standard

# Or per-agent:
agents:
  - name: code_agent
    tools:
      profile: code
  - name: support_agent
    tools:
      profile: safe
```

### Tool Groups

Group tools by category for easier management:

| Group | Tools |
|-------|-------|
| `filesystem` | `file_read`, `file_write`, `file_list`, `file_search` |
| `system` | `shell_exec` |
| `web` | `web_search`, `web_fetch` |
| `media` | `image_generate`, `image_analyze`, `audio_transcribe` |
| `memory` | `memory_store`, `memory_recall` |
| `utility` | `calculator`, `datetime`, `json_parse`, `regex_match` |
| `code` | `code_interpret` |

Use groups in allow/deny lists:

```yaml
tools:
  allow:
    - group:filesystem
    - group:web
    - group:utility
  deny:
    - group:system
```

### Provider Restrictions

Restrict which tools are available per model provider:

```yaml
tools:
  provider_restrictions:
    openai:
      deny:
        - shell_exec       # Don't allow shell access with OpenAI models
    anthropic:
      allow:
        - group:filesystem
        - group:code
        - shell_exec
    google:
      profile: safe         # Use safe profile for Google models
```

## Creating Custom Tools

Define custom tools in your config or as plugin modules:

```yaml
tools:
  custom:
    - name: lookup_user
      description: "Look up a user by email address"
      parameters:
        email:
          type: string
          required: true
          description: "The email address to look up"
      handler:
        type: http
        method: GET
        url: "https://api.example.com/users?email={{ email }}"
        headers:
          Authorization: "Bearer ${{ env.API_TOKEN }}"
```

## Further Reading

Full tool and plugin documentation is available at https://docs.openclaw.ai/tools.
