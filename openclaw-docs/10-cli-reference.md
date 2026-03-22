# CLI Reference

Complete reference for the `openclaw` command-line interface.

## Command Tree

```
openclaw
├── onboard            # Interactive setup wizard
├── dashboard          # Open the Control UI in browser
├── doctor             # Run diagnostics
├── version            # Print version info
│
├── gateway
│   ├── start          # Start the gateway
│   ├── stop           # Stop the gateway
│   ├── restart        # Restart the gateway
│   ├── status         # Show gateway status
│   ├── logs           # Tail gateway logs
│   └── reload         # Hot-reload configuration
│
├── config
│   ├── show           # Print current config
│   ├── get <key>      # Get a config value
│   ├── set <key> <v>  # Set a config value
│   ├── validate       # Validate config file
│   ├── apply          # Apply a full config file
│   ├── patch          # Apply a partial config patch
│   ├── edit           # Open config in $EDITOR
│   ├── path           # Print config file path
│   └── diff           # Show diff from default config
│
├── channel
│   ├── list           # List all channels
│   ├── status <name>  # Check channel status
│   ├── restart <name> # Restart a channel
│   ├── test <name>    # Test channel connection
│   ├── pair <name>    # Pair a mobile node
│   └── unpair <name>  # Unpair a mobile node
│
├── session
│   ├── list           # List active sessions
│   ├── show <id>      # Show session details
│   ├── delete <id>    # Delete a session
│   ├── prune          # Remove expired sessions
│   └── export <id>    # Export session history
│
├── message
│   ├── send           # Send a message via channel
│   └── test           # Send a test message
│
├── model
│   ├── list           # List configured models
│   ├── test <name>    # Test model connectivity
│   └── usage          # Show model usage stats
│
├── plugin
│   ├── install <pkg>  # Install a plugin
│   ├── uninstall <p>  # Remove a plugin
│   ├── list           # List installed plugins
│   ├── update         # Update plugins
│   ├── search <q>     # Search plugin registry
│   └── info <pkg>     # Show plugin details
│
├── tool
│   ├── list           # List available tools
│   ├── info <name>    # Show tool details
│   └── test <name>    # Test a tool
│
├── cron
│   ├── list           # List cron jobs
│   ├── add            # Add a cron job
│   ├── remove <name>  # Remove a cron job
│   ├── run <name>     # Manually trigger a cron job
│   └── status         # Show cron scheduler status
│
├── daemon
│   ├── install        # Install system daemon
│   ├── uninstall      # Remove system daemon
│   ├── start          # Start daemon
│   ├── stop           # Stop daemon
│   └── status         # Check daemon status
│
├── node
│   ├── list           # List paired nodes
│   ├── pair           # Pair a new node
│   ├── unpair <id>    # Unpair a node
│   └── status <id>    # Check node status
│
├── memory
│   ├── list           # List memory entries
│   ├── get <key>      # Get a memory value
│   ├── set <key> <v>  # Set a memory value
│   ├── delete <key>   # Delete a memory entry
│   └── clear          # Clear all memory
│
├── secret
│   ├── list           # List stored secrets
│   ├── set <key> <v>  # Store a secret
│   ├── get <key>      # Retrieve a secret
│   └── delete <key>   # Delete a secret
│
├── docs
│   ├── search <q>     # Search documentation
│   └── open [page]    # Open docs in browser
│
├── tui                # Launch terminal UI
│
├── migrate            # Run config/data migrations
│
└── uninstall          # Full uninstall
```

## Global Flags

These flags are available on all commands:

| Flag | Short | Description |
|------|-------|-------------|
| `--help` | `-h` | Show help for the command |
| `--version` | `-V` | Print version |
| `--config <path>` | `-c` | Path to config file |
| `--home <path>` | | Override OPENCLAW_HOME |
| `--verbose` | `-v` | Verbose output |
| `--debug` | `-d` | Debug output (very verbose) |
| `--quiet` | `-q` | Suppress non-error output |
| `--json` | | Output in JSON format |
| `--no-color` | | Disable colored output |
| `--yes` | `-y` | Auto-confirm prompts |

## Output Styling

By default, the CLI uses colored output with emoji indicators. Control this with:

```bash
# JSON output (for scripting)
openclaw gateway status --json

# Plain text (no colors)
openclaw --no-color gateway status

# Quiet mode (errors only)
openclaw -q gateway restart
```

## Setup and Onboarding

### `openclaw onboard`

Interactive setup wizard.

```bash
openclaw onboard [options]
```

| Option | Description |
|--------|-------------|
| `--install-daemon` | Also install the system daemon |
| `--provider <name>` | Pre-select a provider (skip prompt) |
| `--channel <name>` | Pre-select a channel (skip prompt) |
| `--non-interactive` | Use defaults without prompting |

### `openclaw doctor`

Run system diagnostics.

```bash
openclaw doctor [options]
```

| Option | Description |
|--------|-------------|
| `--fix` | Attempt to fix issues automatically |
| `--check <name>` | Run a specific check only |

Checks performed:
- Node.js version compatibility
- Configuration file validity
- Provider API key connectivity
- Channel connection health
- Daemon status
- Disk space and permissions
- Network connectivity

## Security

### `openclaw secret`

Manage secrets stored in the configured backend.

```bash
# Store a secret
openclaw secret set openai_key "sk-..."

# Retrieve a secret
openclaw secret get openai_key

# List all secret keys
openclaw secret list

# Delete a secret
openclaw secret delete openai_key
```

Secrets are stored using the backend configured in `secrets.backend` (keychain, vault, aws-ssm, or env).

## Plugins

### `openclaw plugin`

Manage the plugin ecosystem.

```bash
# Install a plugin
openclaw plugin install @openclaw/github

# Install a specific version
openclaw plugin install @openclaw/github@2.1.0

# List installed plugins
openclaw plugin list

# Update all plugins
openclaw plugin update --all

# Update a specific plugin
openclaw plugin update @openclaw/github

# Search the registry
openclaw plugin search "calendar"

# Show plugin info
openclaw plugin info @openclaw/github

# Uninstall
openclaw plugin uninstall @openclaw/github
```

## Memory

### `openclaw memory`

Manage persistent memory entries.

```bash
# List all entries
openclaw memory list

# Get a value
openclaw memory get user_preferences

# Set a value
openclaw memory set user_preferences '{"theme": "dark"}'

# Delete an entry
openclaw memory delete user_preferences

# Clear all memory
openclaw memory clear --confirm
```

## Chat Slash Commands

Within an active chat session, these slash commands are available:

| Command | Description |
|---------|-------------|
| `/help` | Show available slash commands |
| `/clear` | Clear the current session |
| `/model <name>` | Switch model for this session |
| `/system <prompt>` | Set system prompt for this session |
| `/tools` | List available tools |
| `/tool <name>` | Toggle a tool on/off |
| `/history` | Show conversation history |
| `/export` | Export conversation as markdown |
| `/session` | Show session info |
| `/reset` | Reset session to defaults |
| `/image <prompt>` | Generate an image |
| `/voice` | Toggle voice mode |

## Channel Helpers

### `openclaw channel pair`

Pair a mobile device node for iMessage or WhatsApp Web:

```bash
# Start pairing (displays QR code)
openclaw channel pair whatsapp-web

# Pair with a specific node ID
openclaw channel pair imessage --node-id abc123

# Check pairing status
openclaw channel status imessage
```

### `openclaw channel test`

Test a channel connection:

```bash
# Test connectivity
openclaw channel test telegram

# Send a test message
openclaw channel test whatsapp --send "Hello from OpenClaw"
```

## Messaging and Agent

### `openclaw message send`

Send a message through a specific channel:

```bash
openclaw message send \
  --channel telegram \
  --to "@username" \
  --text "Hello from CLI"
```

| Option | Description |
|--------|-------------|
| `--channel <name>` | Channel to send through |
| `--to <target>` | Recipient (phone, username, channel ID) |
| `--text <message>` | Message text |
| `--file <path>` | Attach a file |
| `--reply-to <id>` | Reply to a specific message |

## Status

### `openclaw gateway status`

Show detailed gateway status:

```bash
openclaw gateway status
```

Output includes:
- Gateway process status (running/stopped, PID, uptime)
- Configuration file path and validity
- Connected channels and their status
- Active sessions count
- Model provider connectivity
- Resource usage (memory, CPU)

### `openclaw gateway logs`

Tail the gateway logs:

```bash
# Follow logs in real-time
openclaw gateway logs -f

# Show last 100 lines
openclaw gateway logs -n 100

# Filter by level
openclaw gateway logs --level error

# Filter by channel
openclaw gateway logs --channel whatsapp
```

## Gateway

### `openclaw gateway start`

Start the gateway process:

```bash
openclaw gateway start [options]
```

| Option | Description |
|--------|-------------|
| `--foreground` | Run in foreground (don't daemonize) |
| `--port <port>` | Override listen port |
| `--config <path>` | Use specific config file |

### `openclaw gateway stop`

Stop the gateway:

```bash
openclaw gateway stop [options]
```

| Option | Description |
|--------|-------------|
| `--force` | Force kill if graceful shutdown fails |
| `--timeout <sec>` | Graceful shutdown timeout (default: 30) |

### `openclaw gateway restart`

Restart the gateway (stop then start):

```bash
openclaw gateway restart
```

### `openclaw gateway reload`

Hot-reload configuration without restarting:

```bash
openclaw gateway reload
```

## Models

### `openclaw model list`

List configured models:

```bash
openclaw model list
```

### `openclaw model test`

Test model connectivity:

```bash
# Test all models
openclaw model test

# Test a specific model
openclaw model test openai

# Test with a prompt
openclaw model test anthropic --prompt "Say hello"
```

### `openclaw model usage`

Show model usage statistics:

```bash
openclaw model usage [options]
```

| Option | Description |
|--------|-------------|
| `--period <range>` | Time period (today, week, month, all) |
| `--by-channel` | Break down by channel |
| `--by-sender` | Break down by sender |

## System

### `openclaw migrate`

Run migrations when upgrading:

```bash
openclaw migrate [options]
```

| Option | Description |
|--------|-------------|
| `--dry-run` | Show what would be migrated |
| `--from <version>` | Source version |
| `--to <version>` | Target version |

### `openclaw uninstall`

Full uninstall:

```bash
openclaw uninstall [options]
```

| Option | Description |
|--------|-------------|
| `--keep-data` | Don't remove data directory |
| `--keep-config` | Don't remove configuration |

## Cron

### `openclaw cron`

Manage scheduled tasks:

```bash
# List all cron jobs
openclaw cron list

# Add a new cron job
openclaw cron add \
  --name "daily-report" \
  --schedule "0 9 * * *" \
  --action send_message \
  --channel telegram \
  --to "@admin" \
  --message "Daily report"

# Manually trigger a job
openclaw cron run daily-report

# Remove a job
openclaw cron remove daily-report

# Check scheduler status
openclaw cron status
```

## Nodes

### `openclaw node`

Manage paired mobile/remote nodes:

```bash
# List all nodes
openclaw node list

# Pair a new node
openclaw node pair

# Check node status
openclaw node status <node-id>

# Unpair a node
openclaw node unpair <node-id>
```

## Browser / Dashboard

### `openclaw dashboard`

Open the Control UI:

```bash
openclaw dashboard [options]
```

| Option | Description |
|--------|-------------|
| `--port <port>` | Override dashboard port |
| `--no-open` | Don't auto-open browser |

The dashboard provides:
- Real-time session monitoring
- Channel status overview
- Configuration editor
- Log viewer
- Model usage analytics
- Plugin management

## Docs Search

### `openclaw docs`

Access documentation from the CLI:

```bash
# Search docs
openclaw docs search "whatsapp setup"

# Open docs in browser
openclaw docs open

# Open a specific page
openclaw docs open channels/whatsapp
```

## TUI (Terminal UI)

### `openclaw tui`

Launch the interactive terminal UI:

```bash
openclaw tui
```

The TUI provides a full-screen terminal interface with:
- Live session viewer
- Channel status panels
- Log stream
- Quick configuration access
- Keyboard shortcuts for common operations
