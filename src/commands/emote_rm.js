const { SlashCommandBuilder } = require('discord.js');
const redis = require('../redis/client.js');

const data = new SlashCommandBuilder()
	.setName('emote_rm')
	.setDescription('remove emote by name')
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

	const rmResult = await redis.redisEmoteRemove(name);

	if (rmResult === 0) {
		await interaction.editReply({
			content: `remove ${name} success`,
			ephemeral: true,
		});
		return;
	}
	await interaction.editReply({
		content: `cannot remove ${name}`,
		ephemeral: true,
	});
	return;
}

module.exports = {
	data,
	autocomplete,
	execute
}
