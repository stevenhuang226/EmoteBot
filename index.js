const { Client, GateWayIntentBits, SlashCommandBuilder } = require('discord.js');
const { TOKEN } = require('config/TOKEN.js');
const { fs } = require('fs');
const { path } = require('path');

const client = new Client({
	intents: [
		GateWayIntentBits.Guilds,
		GateWayIntentBits.MessageContent,
	]
});

// add command files in ./commands
client.commands = new Collection();
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
	const command = require(`./command/${file}`);
	client.commands.set(command.data.name, command);
}

client.on(Events.InteractionCreate, async interaction => {
	if (interaction.isChatInputCommand()) {
		await interactionChatInputCommand(interaction);
	}
	if (interaction.isAutocomplete()) {
		await interactionAutocomplete(interaction);
	}
});

async function interactionChatInputCommand(interaction) {
	const command = client.command.get(interaction.commandName);
	if (! command) return;
	try {
		await command.execute(interaction);
	} catch (err) {
		console.log(err);
		if (interaction.replied || interaction.deferred) {
			await interaction.followUp({content: `Error ${err}`, ephemeral: true});
		} else {
			await interaction.reply({content: `Error ${err}`, ephemeral: true});
		}
	}
}

async function interactoinAutocomplete(interaction) {
	const command = client.command.get(interaction.commandName);
	if (! command?.autocomplete) return;
	try {
		await command.autocomplete(interaction);
	} catch (err) {
		console.log('autocomplete ', err);
	}
}

client.once(Events.ClientReady, () => {
	console.log(`Logged in as ${client.user.tag}`);
});

client.login(TOKEN);
