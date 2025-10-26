# Overview

This is a Discord selfbot application built with Node.js that provides automated interaction features. The bot responds to commands with a comma (`,`) prefix and includes functionality for automatic reactions, auto-pinging users, and chatpack (auto-response) features. It uses the discord.js-selfbot-v13 library to interact with Discord's API as a user account rather than a traditional bot account.

**Key Features:**
- Command-based interaction system with prefix
- Automated emoji reactions to specific users' messages
- Auto-ping functionality with configurable intervals
- Chatpack auto-response system
- In-memory state management for active features

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Core Technology Stack

**Runtime Environment:** Node.js
- Main entry point: `bot.js`
- Package manager: npm with lock file for dependency consistency

**Discord Integration:** discord.js-selfbot-v13 (v3.7.1)
- Uses selfbot library instead of standard Discord bot library
- Allows the application to run as a user account rather than a bot account
- **Important:** This is a selfbot implementation, which operates in a gray area of Discord's Terms of Service

## Application Structure

**Single-File Architecture:**
- All bot logic contained in `bot.js`
- No separation of concerns into modules/controllers
- Suitable for small-scale automation tasks

**Event-Driven Design:**
- Uses Discord.js event listeners (`ready`, `messageCreate`)
- Reacts to incoming messages in real-time
- No persistent storage or database layer

## State Management

**In-Memory Storage Using JavaScript Maps:**
- `reactionTargets`: Maps user IDs to emoji strings for automated reactions
- `autoPingIntervals`: Stores active ping intervals for users
- `chatpackActive`: Tracks which users have chatpack auto-response enabled
- `logs`: Array for storing application logs

**Implications:**
- All state is lost on application restart
- No persistence layer means configurations reset on each deployment
- Scalability limited to single-instance deployments

## Authentication & Configuration

**Environment-Based Token Management:**
- Discord token stored in `DISCORD_BOT_TOKEN` environment variable
- Token validation on startup with error handling
- Application exits if token is missing or invalid

**Security Considerations:**
- Token must be kept secure in Replit Secrets
- No additional authentication layer for command access
- Anyone with access to channels can trigger commands (if implementation is extended)

## Command System Design

**Prefix-Based Commands:**
- Global prefix constant: `,`
- Easily configurable for different deployment contexts
- Command parsing logic would be implemented in the message event handler

## Error Handling Strategy

**Graceful Degradation:**
- Try-catch blocks around Discord API calls (reactions, replies)
- Logs errors without crashing the application
- Silent failures for non-critical features (reactions, auto-responses)

**Startup Validation:**
- Critical configuration (token) validated before client connection
- Process exits early if prerequisites not met

# External Dependencies

## Discord API Integration

**discord.js-selfbot-v13 (Primary Dependency)**
- Purpose: Provides Discord API client for user account automation
- Version: 3.7.1
- Features Used:
  - Client connection and authentication
  - Message event listening
  - Emoji reactions
  - Message replies
  - MessageEmbed (imported but usage not shown in provided code)

**Supporting Libraries:**
- @discordjs/builders: Command and embed building utilities
- @discordjs/collection: Data structure utilities
- @discordjs/formatters: Message formatting helpers
- debug (v4.4.3): Debugging utility

## Runtime Environment

**Replit Platform:**
- Expects environment variables through Replit Secrets
- Uses Replit's Node.js runtime environment
- No database or external storage services configured

## Third-Party Services

**Discord Platform:**
- Connects to Discord's WebSocket gateway
- Requires valid Discord user token for authentication
- Subject to Discord's rate limits and API restrictions

## Notable Architecture Decisions

**Selfbot vs Bot Account:**
- **Decision:** Uses discord.js-selfbot-v13 for user account automation
- **Rationale:** Allows automation of a user account rather than creating a dedicated bot
- **Trade-offs:** 
  - Pros: Can interact as a regular user, access to user-only features
  - Cons: Against Discord ToS, risk of account termination, ethical concerns
- **Alternatives:** Standard discord.js bot library with proper bot account

**No Database Layer:**
- **Decision:** All state stored in-memory using JavaScript Maps
- **Rationale:** Simplicity for small-scale automation
- **Trade-offs:**
  - Pros: Simple implementation, no database setup required
  - Cons: No persistence across restarts, limited scalability

**Monolithic Structure:**
- **Decision:** Single-file application architecture
- **Rationale:** Small codebase with limited complexity
- **Trade-offs:**
  - Pros: Easy to understand and deploy
  - Cons: Harder to maintain as features grow, no code reusability