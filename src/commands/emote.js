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
	const matched = await redis.redisEmotePrefixSearch(query, 25);
	const options = matched.map(name => ({
		name: name,
		value: name,
	}));

	await interaction.respond(options);
}

async function execute(interaction) {
	const name = interaction.options.getString('name');
	const emotePath = await redis.redisEmoteGet(name);
	if (emotePath === 'Error' || emotePath === null || emotePath === undefined) {
		await interaction.editReply({
			content: `${name} not found`,
			ephemeral: true,
		});
		return;
	}
	await interaction.editReply({
		content: emotePath,
	});
}

module.exports = {
	data,
	autocomplete,
	execute
}
