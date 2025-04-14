const { TOKEN } = require('../config/TOKEN.js');
const { REST, Routes } = require('discord.js');


const rest = new REST().setToken(TOKEN);
async function deployCommands(client, commands) {
	const guildIDs = client.guilds.cache.map(guild => guild.id);
	for (let i = 0; i < guildIDs.length; ++i) {
		await rest.put(
			Routes.applicationGuildCommands(client.user.id, guildIDs[i]),
			{ body: commands }
		);
		console.log(`put commands to ${guildIDs[i]}`);
	}
}

module.exports = {
	deployCommands
}
