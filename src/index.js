const { Client, Collection, Events, GatewayIntentBits, REST, Routes, SlashCommandBuilder } = require('discord.js');
const { TOKEN } = require('./config/TOKEN.js');
const fs = require('fs');
const args = process.argv.slice(2);

const client = new Client({
	intents: [
		GatewayIntentBits.Guilds,
		GatewayIntentBits.MessageContent,
	]
});

// add command files in ./commands
client.commands = new Collection();
const commandFiles = fs.readdirSync('./src/commands').filter(file => file.endsWith('.js'));
let commands = [];
for (const file of commandFiles) {
	const command = require(`./commands/${file}`);
	client.commands.set(command.data.name, command);
	commands.push(command.data.toJSON());
}

client.on(Events.ClientReady, () => {
	if (! args.includes('--deploy-commands')) {
		return;
	}
	const { deployCommands } = require('./utils/deploy_commands.js');
	deployCommands(client, commands);
})
// interaction event
client.on(Events.InteractionCreate, async interaction => {
	if (interaction.isChatInputCommand()) {
		await interactionChatInputCommand(interaction);
	}
	if (interaction.isAutocomplete()) {
		await interactionAutocomplete(interaction);
	}
});

async function interactionChatInputCommand(interaction) {
	const command = client.commands.get(interaction.commandName);
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

async function interactionAutocomplete(interaction) {
	const command = client.commands.get(interaction.commandName);
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
