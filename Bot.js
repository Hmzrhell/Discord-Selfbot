const { Client, MessageEmbed } = require('discord.js-selfbot-v13');

const PREFIX = '++';
const reactionTargets = new Map();
const autoPingIntervals = new Map();
const chatpackActive = new Map();
const logs = [];
let afkStatus = {
  enabled: false,
  message: 'I am currently AFK',
  enabledAt: null,
  previousStatus: null,
  lastReplyTime: 0
};

const client = new Client({
  checkUpdate: false
});

const token = process.env.DISCORD_BOT_TOKEN?.trim();
const authorizedUserId = process.env.DISCORD_USER_ID?.trim();

if (!token) {
  console.error('ERROR: DISCORD_BOT_TOKEN is not set!');
  console.error('Please add your Discord bot token to the Secrets.');
  process.exit(1);
}

if (!authorizedUserId) {
  console.error('ERROR: DISCORD_USER_ID is not set!');
  console.error('Please add your Discord user ID to the Secrets.');
  process.exit(1);
}

console.log('Connecting to Discord...');
client.login(token);

client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);
  console.log(`Prefix: ${PREFIX}`);
  console.log('Bot is ready!');
});

client.on('messageCreate', async (message) => {
  if (message.author.bot) return;
  
  // Check if someone mentioned or replied to the authorized user while AFK
  if (afkStatus.enabled && message.author.id !== authorizedUserId) {
    const mentionsUser = message.mentions.has(authorizedUserId);
    const repliesUser = message.reference?.messageId && message.channel.messages.cache.get(message.reference.messageId)?.author.id === authorizedUserId;
    
    if (mentionsUser || repliesUser) {
      try {
        afkStatus.lastReplyTime = Date.now();
        await message.reply(`User is AFK: ${afkStatus.message}`);
      } catch (e) {
        console.log('Failed to send AFK reply:', e.message);
      }
    }
  }
  
  // If authorized user sends a message and they're AFK, disable AFK
  // But only if AFK was enabled more than 5 seconds ago (to prevent immediate disable)
  // And only if it's not the bot's own AFK reply (check if last reply was within 2 seconds)
  if (afkStatus.enabled && message.author.id === authorizedUserId && !message.content.startsWith(PREFIX)) {
    const timeSinceAfk = Date.now() - (afkStatus.enabledAt || 0);
    const timeSinceReply = Date.now() - afkStatus.lastReplyTime;
    
    // Only disable if AFK was set more than 5 seconds ago AND it's not right after bot's AFK reply
    if (timeSinceAfk > 5000 && timeSinceReply > 2000) {
      afkStatus.enabled = false;
      
      // Restore previous status
      if (afkStatus.previousStatus) {
        try {
          await client.user.setActivity(afkStatus.previousStatus.text, afkStatus.previousStatus.options);
        } catch (e) {
          console.log('Failed to restore previous status:', e.message);
        }
      }
      
      try {
        await message.channel.send('Welcome back! AFK status disabled.');
      } catch (e) {
        console.log('Failed to send AFK disabled message:', e.message);
      }
    }
  }
  
  // Handle reactions and chatpack for any message
  if (reactionTargets.has(message.author.id)) {
    const emoji = reactionTargets.get(message.author.id);
    try {
      await message.react(emoji);
    } catch (e) {
      console.log('Failed to react:', e.message);
    }
  }
  
  if (chatpackActive.has(message.author.id)) {
    try {
      await message.reply('Auto-response from chatpack!');
    } catch (e) {
      console.log('Failed to send chatpack reply:', e.message);
    }
  }

  // Handle commands
  if (!message.content.startsWith(PREFIX)) return;
  if (message.author.id !== authorizedUserId) return;

  const args = message.content.slice(PREFIX.length).trim().split(/ +/);
  const command = args.shift().toLowerCase();

  logs.push({
    timestamp: new Date(),
    channel: message.channel.id,
    author: message.author.tag,
    content: message.content
  });

  if (logs.length > 1000) {
    logs.splice(0, logs.length - 1000);
  }

  try {
    if (command === 'cmds') {
      const category = args[0];
      
      if (!category) {
        // Show main menu
        await message.channel.send(`\`\`\`
━━━━━━━━━━━━━━━━━━━━━━━━━━━

╦  ╔═╗╦  ╦╔═╗═╗ ╦╔═╗ ╦╦═╗╔═╗╔╦╗
║  ║ ║╚╗╔╝║╣ ╔╩╦╝╠═╝ ║╠╦╝║╣  ║║
╩═╝╚═╝ ╚╝ ╚═╝╩ ╚═╩   ╩╩╚═╚═╝═╩╝

━━━━━━━━━━━━━━━━━━━━━━━━━━━
      COMMAND MENU
━━━━━━━━━━━━━━━━━━━━━━━━━━━

[1] Reactions
[2] Messages  
[3] Controls
[4] Logs
[5] Utilities

━━━━━━━━━━━━━━━━━━━━━━━━━━━

Type ++cmds [number] to view
Example: ++cmds 1

━━━━━━━━━━━━━━━━━━━━━━━━━━━
\`\`\``);
      } else if (category === '1') {
        await message.channel.send(`\`\`\`
━━━━━━━━━━━━━━━━━━━━━━━━━━━
      [1] REACTION COMMANDS
━━━━━━━━━━━━━━━━━━━━━━━━━━━

++react <user_id> <emoji>
Example: ++react 123456789 👍

++stop <user_id>
Example: ++stop 123456789

++clear
Example: ++clear

━━━━━━━━━━━━━━━━━━━━━━━━━━━
Type ++cmds to return to menu
━━━━━━━━━━━━━━━━━━━━━━━━━━━
\`\`\``);
      } else if (category === '2') {
        await message.channel.send(`\`\`\`
━━━━━━━━━━━━━━━━━━━━━━━━━━━
      [2] MESSAGING COMMANDS
━━━━━━━━━━━━━━━━━━━━━━━━━━━

++say <msg>
Example: ++say Secret message

++dm <user_id> <msg>
Example: ++dm 123456789 Hey

++loop <msg> <count> <delay>
Example: ++loop hello 5 2

++type <msg>
Example: ++type I'm typing...

++emoji <emoji>
Example: ++emoji 🔥

++embed <title> | <desc>
Example: ++embed Title | Desc

++chatpack <user_id>
Example: ++chatpack 123456789

++massdm <msg>
Example: ++massdm Hello

++spam <msg> <count>
Example: ++spam Hello 5

━━━━━━━━━━━━━━━━━━━━━━━━━━━
Type ++cmds to return to menu
━━━━━━━━━━━━━━━━━━━━━━━━━━━
\`\`\``);
      } else if (category === '3') {
        await message.channel.send(`\`\`\`
━━━━━━━━━━━━━━━━━━━━━━━━━━━
       [3] CONTROL COMMANDS
━━━━━━━━━━━━━━━━━━━━━━━━━━━

++edit <msg_id> <new>
Example: ++edit 98765 New text

++end [user_id]
Example: ++end 123456789

++delete <msg_id>
Example: ++delete 98765

++purge <amount>
Example: ++purge 10

++copy <msg_id>
Example: ++copy 98765

++vanish
Example: ++vanish

━━━━━━━━━━━━━━━━━━━━━━━━━━━
Type ++cmds to return to menu
━━━━━━━━━━━━━━━━━━━━━━━━━━━
\`\`\``);
      } else if (category === '4') {
        await message.channel.send(`\`\`\`
━━━━━━━━━━━━━━━━━━━━━━━━━━━
    [4] LOGS & AUTO COMMANDS
━━━━━━━━━━━━━━━━━━━━━━━━━━━

++showlogs [channel_id]
Example: ++showlogs

++autoping <user_id> <interval>
Example: ++autoping 123456789 5

++stopautoping
Example: ++stopautoping

━━━━━━━━━━━━━━━━━━━━━━━━━━━
Type ++cmds to return to menu
━━━━━━━━━━━━━━━━━━━━━━━━━━━
\`\`\``);
      } else if (category === '5') {
        await message.channel.send(`\`\`\`
━━━━━━━━━━━━━━━━━━━━━━━━━━━
      [5] UTILITY COMMANDS
━━━━━━━━━━━━━━━━━━━━━━━━━━━

++status <text> [mode]
Example: ++status Chilling

++ping
Example: ++ping

++userinfo [user]
Example: ++userinfo @user

++serverinfo
Example: ++serverinfo

++cloak <new_name>
Example: ++cloak NewName

++hack <user>
Example: ++hack @user

++afk [message]
Example: ++afk example
Auto-reply when mentioned/pinged

━━━━━━━━━━━━━━━━━━━━━━━━━━━
Type ++cmds to return to menu
━━━━━━━━━━━━━━━━━━━━━━━━━━━
\`\`\``);
      } else {
        await message.channel.send('Invalid category. Use `++cmds` to see available categories.');
      }
    }

    else if (command === 'react') {
      const emoji = args.pop();
      const userIds = args.slice(0, 25);
      
      if (userIds.length === 0 || !emoji) {
        return message.channel.send('Usage: ,react <user_id> [user_id2] ... <emoji> (max 25 users)');
      }

      try {
        await message.react(emoji);
      } catch (e) {}

      userIds.forEach(userId => {
        reactionTargets.set(userId, emoji);
      });

      try {
        await message.channel.send(`Started reacting to ${userIds.length} user(s)`);
      } catch (e) {
        console.log('Confirmation message blocked by server');
      }
    }

    else if (command === 'stop') {
      const userId = args[0];
      if (!userId) return message.channel.send('Usage: ,stop <user_id>');

      if (reactionTargets.has(userId)) {
        reactionTargets.delete(userId);
        await message.channel.send(`Stopped reacting to ${userId}`);
      } else {
        await message.channel.send(`No active reactions for ${userId}`);
      }
    }

    else if (command === 'clear') {
      reactionTargets.clear();
      await message.channel.send('Cleared all reaction targets');
    }

    else if (command === 'spam') {
      const count = parseInt(args.pop());
      const msg = args.join(' ');
      if (!msg || isNaN(count)) return message.channel.send('Usage: ,spam <msg> <count>');

      for (let i = 0; i < Math.min(count, 50); i++) {
        await message.channel.send(msg);
      }
    }

    else if (command === 'chatpack') {
      const userId = args[0];
      if (!userId) return message.channel.send('Usage: ,chatpack <user_id>');

      chatpackActive.set(userId, true);
      await message.channel.send(`Chatpack activated for <@${userId}>. Will auto-reply to their messages. Use ,end to stop.`);
    }

    else if (command === 'end') {
      const userId = args[0];
      if (!userId) {
        chatpackActive.clear();
        await message.channel.send('All chatpacks ended');
      } else if (chatpackActive.has(userId)) {
        chatpackActive.delete(userId);
        await message.channel.send(`Chatpack ended for <@${userId}>`);
      } else {
        await message.channel.send(`No active chatpack for ${userId}`);
      }
    }

    else if (command === 'massdm') {
      const msg = args.join(' ');
      if (!msg) return message.channel.send('Usage: ,massdm <msg>');

      if (!message.guild) {
        return message.channel.send('This command only works in servers');
      }

      const members = await message.guild.members.fetch();
      let sent = 0;
      for (const [id, member] of members) {
        if (member.user.bot) continue;
        try {
          await member.send(msg);
          sent++;
        } catch (e) {}
      }
      await message.channel.send(`Mass DM sent to ${sent} users`);
    }

    else if (command === 'say') {
      const msg = args.join(' ');
      if (!msg) return message.channel.send('Usage: ,say <msg>');

      try {
        await message.delete();
      } catch (e) {
        console.log('Could not delete command message (no permissions)');
      }
      await message.channel.send(msg);
    }

    else if (command === 'embed') {
      const text = args.join(' ');
      const parts = text.split('|');
      if (parts.length < 2) return message.channel.send('Usage: ,embed <title> | <desc>');

      const embed = new MessageEmbed()
        .setTitle(parts[0].trim())
        .setDescription(parts[1].trim())
        .setColor('#5865F2');
      await message.channel.send({ content: ' ', embeds: [embed] });
    }

    else if (command === 'dm') {
      const userId = args[0];
      const msg = args.slice(1).join(' ');
      if (!userId || !msg) return message.channel.send('Usage: ,dm <user_id> <msg>');

      try {
        const user = await client.users.fetch(userId);
        await user.send(msg);
        await message.channel.send(`DM sent to ${user.tag}`);
      } catch (e) {
        await message.channel.send('Failed to send DM');
      }
    }

    else if (command === 'loop') {
      const delay = parseInt(args.pop());
      const count = parseInt(args.pop());
      const msg = args.join(' ');
      if (!msg || isNaN(count) || isNaN(delay)) {
        return message.channel.send('Usage: ,loop <msg> <count> <delay>');
      }

      for (let i = 0; i < Math.min(count, 50); i++) {
        await message.channel.send(msg);
        await new Promise(resolve => setTimeout(resolve, delay * 1000));
      }
    }

    else if (command === 'type') {
      const msg = args.join(' ');
      if (!msg) return message.channel.send('Usage: ,type <msg>');

      await message.channel.sendTyping();
      await new Promise(resolve => setTimeout(resolve, 3000));
      await message.channel.send(msg);
    }

    else if (command === 'emoji') {
      const emoji = args[0];
      if (!emoji) return message.channel.send('Usage: ,emoji <emoji>');

      await message.channel.send(emoji);
    }

    else if (command === 'edit') {
      const msgId = args[0];
      const newContent = args.slice(1).join(' ');
      if (!msgId || !newContent) return message.channel.send('Usage: ,edit <msg_id> <new>');

      try {
        const msg = await message.channel.messages.fetch(msgId);
        if (msg.author.id !== client.user.id) {
          return message.channel.send('Can only edit my own messages');
        }
        await msg.edit(newContent);
        await message.channel.send('Message edited');
      } catch (e) {
        await message.channel.send('Failed to edit message');
      }
    }

    else if (command === 'delete') {
      const msgId = args[0];
      if (!msgId) return message.channel.send('Usage: ,delete <msg_id>');

      try {
        const msg = await message.channel.messages.fetch(msgId);
        await msg.delete();
        await message.channel.send('Message deleted');
      } catch (e) {
        await message.channel.send('Failed to delete message');
      }
    }

    else if (command === 'purge') {
      const amount = parseInt(args[0]);
      if (isNaN(amount) || amount < 1 || amount > 100) {
        return message.channel.send('Usage: ,purge <amount> (1-100)');
      }

      try {
        const messages = await message.channel.messages.fetch({ limit: 100 });
        const myMessages = messages.filter(m => m.author.id === client.user.id);
        
        let deleted = 0;
        for (const msg of myMessages.values()) {
          if (deleted >= amount) break;
          try {
            await msg.delete();
            deleted++;
          } catch (e) {}
        }
        
        const reply = await message.channel.send(`Deleted ${deleted} of your messages`);
        setTimeout(() => reply.delete().catch(() => {}), 3000);
      } catch (e) {
        await message.channel.send('Failed to purge messages');
      }
    }

    else if (command === 'copy') {
      const msgId = args[0];
      if (!msgId) return message.channel.send('Usage: ,copy <msg_id>');

      try {
        const msg = await message.channel.messages.fetch(msgId);
        if (!msg.content && msg.embeds.length === 0) {
          return message.channel.send('Message has no content to copy');
        }
        if (msg.content) {
          await message.channel.send(msg.content);
        } else {
          await message.channel.send('Message only contains embeds (cannot copy)');
        }
      } catch (e) {
        await message.channel.send('Failed to copy message');
      }
    }

    else if (command === 'vanish') {
      await message.delete();
      const reply = await message.channel.send('Message will vanish in 5 seconds...');
      setTimeout(() => reply.delete().catch(() => {}), 5000);
    }

    else if (command === 'removereply') {
      const trigger = args.join(' ');
      if (!trigger) return message.channel.send('Usage: ,removereply <trigger>');
      await message.channel.send(`Auto-reply for "${trigger}" removed (not implemented yet)`);
    }

    else if (command === 'showlogs') {
      const channelId = args[0] || message.channel.id;
      const channelLogs = logs.filter(log => log.channel === channelId).slice(-10);
      
      if (channelLogs.length === 0) {
        return message.channel.send('No logs found');
      }

      const logText = channelLogs.map(log => 
        `[${log.timestamp.toLocaleTimeString()}] ${log.author}: ${log.content}`
      ).join('\n');

      await message.channel.send(`\`\`\`\n${logText}\n\`\`\``);
    }

    else if (command === 'autoping') {
      const userId = args[0];
      const interval = parseInt(args[1]);
      if (!userId || isNaN(interval)) {
        return message.channel.send('Usage: ,autoping <user_id> <interval>');
      }

      const existingInterval = autoPingIntervals.get(message.author.id);
      if (existingInterval) {
        clearInterval(existingInterval);
      }

      const pingInterval = setInterval(async () => {
        await message.channel.send(`<@${userId}>`);
      }, interval * 1000);

      autoPingIntervals.set(message.author.id, pingInterval);
      await message.channel.send(`Auto-pinging <@${userId}> every ${interval} seconds`);
    }

    else if (command === 'stopautoping') {
      const interval = autoPingIntervals.get(message.author.id);
      if (interval) {
        clearInterval(interval);
        autoPingIntervals.delete(message.author.id);
        await message.channel.send('Auto-ping stopped');
      } else {
        await message.channel.send('No active auto-ping');
      }
    }

    else if (command === 'status') {
      const modeKeywords = ['streaming', 'playing', 'watching', 'listening', 'competing'];
      let mode = 'PLAYING';
      let statusText = args.join(' ');
      
      const lastArg = args[args.length - 1]?.toLowerCase();
      if (lastArg && modeKeywords.includes(lastArg)) {
        mode = lastArg.toUpperCase();
        statusText = args.slice(0, -1).join(' ');
      }
      
      if (!statusText) return message.channel.send('Usage: ,status <text> [mode: streaming/playing/watching/listening/competing]');

      const options = { type: mode };
      if (mode === 'STREAMING') {
        options.url = 'https://twitch.tv/lovexpired';
      }
      
      await client.user.setActivity(statusText, options);
      await message.channel.send(`Status set to: ${statusText} (${mode.toLowerCase()})`);
    }

    else if (command === 'ping') {
      const sent = await message.channel.send('Pinging...');
      const ping = sent.createdTimestamp - message.createdTimestamp;
      await sent.edit(`🏓 Pong! Latency: ${ping}ms | API: ${Math.round(client.ws.ping)}ms`);
    }

    else if (command === 'userinfo') {
      const user = message.mentions.users.first() || message.author;
      const member = message.guild ? message.guild.members.cache.get(user.id) : null;

      const embed = new MessageEmbed()
        .setTitle(`User Info: ${user.tag}`)
        .setThumbnail(user.displayAvatarURL())
        .addFields(
          { name: 'ID', value: user.id, inline: true },
          { name: 'Created', value: `<t:${Math.floor(user.createdTimestamp / 1000)}:R>`, inline: true },
          { name: 'Joined', value: member ? `<t:${Math.floor(member.joinedTimestamp / 1000)}:R>` : 'N/A', inline: true }
        )
        .setColor('#5865F2');
      await message.channel.send({ content: ' ', embeds: [embed] });
    }

    else if (command === 'serverinfo') {
      if (!message.guild) {
        return message.channel.send('This command only works in servers');
      }

      const guild = message.guild;
      const embed = new MessageEmbed()
        .setTitle(`Server Info: ${guild.name}`)
        .setThumbnail(guild.iconURL())
        .addFields(
          { name: 'ID', value: guild.id, inline: true },
          { name: 'Owner', value: `<@${guild.ownerId}>`, inline: true },
          { name: 'Members', value: guild.memberCount.toString(), inline: true },
          { name: 'Created', value: `<t:${Math.floor(guild.createdTimestamp / 1000)}:R>`, inline: true }
        )
        .setColor('#5865F2');
      await message.channel.send({ content: ' ', embeds: [embed] });
    }

    else if (command === 'cloak') {
      const newName = args.join(' ');
      if (!newName) return message.channel.send('Usage: ,cloak <new_name>');

      try {
        await client.user.setUsername(newName);
        await message.channel.send(`Username changed to: ${newName}`);
      } catch (e) {
        await message.channel.send('Failed to change username (rate limited or invalid name)');
      }
    }

    else if (command === 'hack') {
      const user = args[0];
      if (!user) return message.channel.send('Usage: ,hack <user>');

      await message.channel.send(`Hacking ${user}...`);
      await new Promise(resolve => setTimeout(resolve, 1000));
      await message.channel.send('█▒▒▒▒▒▒▒▒▒ 10%');
      await new Promise(resolve => setTimeout(resolve, 1000));
      await message.channel.send('████▒▒▒▒▒▒ 40%');
      await new Promise(resolve => setTimeout(resolve, 1000));
      await message.channel.send('███████▒▒▒ 70%');
      await new Promise(resolve => setTimeout(resolve, 1000));
      await message.channel.send('██████████ 100%');
      await new Promise(resolve => setTimeout(resolve, 500));
      await message.channel.send(`Successfully hacked ${user}! 😎`);
    }

    else if (command === 'afk') {
      const afkMessage = args.join(' ');
      
      try {
        await message.delete();
      } catch (e) {
        console.log('Could not delete command message');
      }
      
      // Save current status before changing it
      const currentPresence = client.user.presence;
      if (currentPresence && currentPresence.activities && currentPresence.activities.length > 0) {
        const activity = currentPresence.activities[0];
        afkStatus.previousStatus = {
          text: activity.name,
          options: {
            type: activity.type,
            url: activity.url || undefined
          }
        };
      } else {
        afkStatus.previousStatus = null;
      }
      
      // Set AFK status
      try {
        await client.user.setActivity('AFK', { type: 'PLAYING' });
      } catch (e) {
        console.log('Failed to set AFK status:', e.message);
      }
      
      if (!afkMessage) {
        afkStatus.enabled = true;
        afkStatus.message = 'I am currently AFK';
        afkStatus.enabledAt = Date.now();
        const reply = await message.channel.send('AFK status enabled with default message.');
        setTimeout(() => reply.delete().catch(() => {}), 3000);
      } else {
        afkStatus.enabled = true;
        afkStatus.message = afkMessage;
        afkStatus.enabledAt = Date.now();
        const reply = await message.channel.send(`AFK status enabled: ${afkMessage}`);
        setTimeout(() => reply.delete().catch(() => {}), 3000);
      }
    }

  } catch (error) {
    console.error('Command error:', error);
    try {
      await message.channel.send('An error occurred while executing the command.');
    } catch (e) {
      console.error('Failed to send error message:', e);
    }
  }
});

console.log('Starting Discord bot...');
