# Discord Selfbot

A Discord selfbot built with Node.js that provides automated interaction features. This bot responds to commands with a `++` prefix and includes functionality for automatic reactions, auto-pinging users, and chatpack (auto-response) features.

## ⚠️ Important Warning

This is a **selfbot** - it runs on a user account rather than a bot account. Using selfbots is against Discord's Terms of Service and may result in your account being banned. Use at your own risk.

## Features

- 🎯 Command-based interaction system with prefix
- 😄 Automated emoji reactions to specific users' messages  
- 📢 Auto-ping functionality with configurable intervals
- 💬 Chatpack auto-response system
- 📝 Message logging and management
- 🔧 User and server information commands

## Installation

1. Clone this repository:
```bash
git clone https://github.com/Hmzrhell/discord-selfbot.git
cd discord-selfbot
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
   - Create a `.env` file or add to your hosting platform's secrets:
   ```
   DISCORD_BOT_TOKEN=your_discord_user_token_here
   DISCORD_USER_ID=your_discord_user_id_here
   ```

## Getting Your Credentials

### Discord User Token
1. Open Discord in your browser (not the app)
2. Press `F12` to open Developer Tools
3. Go to the `Console` tab
4. Paste this code and press Enter:
   ```javascript
   (webpackChunkdiscord_app.push([[''],{},e=>{m=[];for(let c in e.c)m.push(e.c[c])}]),m).find(m=>m?.exports?.default?.getToken!==void 0).exports.default.getToken()
   ```
5. Copy the token (without quotes)

### Discord User ID
1. Enable Developer Mode in Discord: Settings → Advanced → Developer Mode
2. Right-click your username anywhere
3. Click "Copy User ID"

## Usage

Start the bot:
```bash
node bot.js
```

## Commands

### Reaction
- `++react <user_id> <emoji>` - Auto-react to a user's messages
- `++stop <user_id>` - Stop reacting to a user
- `++clear` - Clear all reaction targets

### Messaging
- `++spam <msg> <count>` - Send a message multiple times
- `++chatpack <user_id>` - Auto-reply to a user's messages
- `++massdm <msg>` - Send DM to all server members
- `++say <msg>` - Send a message and delete your command
- `++dm <user_id> <msg>` - Send a DM to a user
- `++loop <msg> <count> <delay>` - Send messages in a loop (minimum 1 second delay)
- `++type <msg>` - Show typing indicator then send
- `++emoji <emoji>` - Send an emoji

### Control
- `++edit <msg_id> <new>` - Edit your message
- `++end [user_id]` - End chatpack for user or all
- `++delete <msg_id>` - Delete a message
- `++purge <amount>` - Delete your recent messages
- `++copy <msg_id>` - Copy a message's content
- `++vanish` - Send a self-deleting message

### Logs & Auto
- `++showlogs [channel_id]` - Show command logs
- `++autoping <user_id> <interval>` - Auto-ping a user
- `++stopautoping` - Stop auto-pinging

### Utilities
- `++cmds` - Show all commands
- `++status <text> [mode]` - Set your status
- `++ping` - Check bot latency
- `++userinfo [user]` - Get user information
- `++serverinfo` - Get server information
- `++cloak <new_name>` - Change username
- `++hack <user>` - Fun hack animation

## Configuration

You can customize the bot by editing `Bot.js`:

- `PREFIX` - Change the command prefix (default: `++`)
- Command permissions are restricted to the user ID in `DISCORD_USER_ID`

## Security Notes

- Never share your Discord token
- Never commit your `.env` file or tokens to Git
- The `.gitignore` file is already configured to protect your secrets
- Your token and user ID should only be stored in environment variables

## Project Structure

```
discord-selfbot/
├── bot.js              # Main bot file
├── package.json        # Dependencies
├── .gitignore         # Git ignore rules
└── README.md          # This file
```

## Tech Stack

- **Runtime:** Node.js
- **Library:** discord.js-selfbot-v13
- **State Management:** In-memory (Maps and Arrays)

## Disclaimer

This project is for educational purposes only. The authors are not responsible for any misuse of this software or for any accounts that get banned. Using selfbots violates Discord's Terms of Service.

## License

MIT License - feel free to use and modify as needed.
