const { SlashCommandBuilder } = require('discord.js');
const redis = require('../redis/client.js');

const data = new SlashCommandBuilder()
	.setName('emote')
	.setDescription('send a emote')
	.addStringOption(opt => 
		opt.setName('name')
			.setDescription('emote name')
			.setRequired(true)
			.setAutocomplete(true)
	);

async function autocomplete(interaction) {
	const focusedOption = interaction.options.getFocused(true);

	if (focusedOption.name !== 'name') return;

	const query = focusedOption.value;
	const matched = redis.redisEmotePrefixSearch(query, 25);
	const options = matched.map(name => ({
		name: name,
		option: name,
	}));

	await interaction.respond(options);
}

async function execute(interaction) {
	const name = interaction.options.getString('name');
	const emotePath = redis.redisEmoteGet(name);
	if (emotePath === 'Error') {
		await interaction.reply({
			content: `${name} not found`,
			ephemeral: true,
		});
		return;
	}
	/*
	if (! filePath.startWith('http') && ! fs.existsSync(filePath)) {
		await interaction.replay({
			content: `path: ${filePath} file lose`,
			ephemeral: true,
		})
		return;
	}
	*/
	await interaction.reply({
		files: [emotePath]
	});
}

module.exports = {
	data,
	autocomplete,
	execute
}
