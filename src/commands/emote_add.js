const { SlashCommandBuilder } = require('discord.js');
const redis = require('../redis/client.js');

const data = new SlashCommandBuilder()
	.setName('emote_add')
	.setDescription('set new emote by url')
	.addStringOption(opt => 
		opt.setName('name')
			.setDescription('emote name')
			.setRequired(true)
			.setAutocomplete(false)
	)
	.addStringOption(opt => 
		opt.setName('url')
			.setDescription('emote origin url')
			.setRequired(true)
			.setAutocomplete(false)
	);

async function execute(interaction) {
	const name = interaction.options.getString('name');
	const source = interaction.options.getString('url');

	if (await redis.redisEmoteNameCheck(name)) {
		await interaction.editReply({
			content: `${name} had exists, cannot be add`,
			ephemeral: true,
		});
		return;
	}

	const addResult = await redis.redisEmoteAdd(name, source);
	if (addResult === 0) {
		await interaction.editReply({
			content: `add ${name}/${source} success`,
		});
		return;
	}

	await interaction.editReply({
		content: `add ${name} failed`,
		ephemeral: true,
	});
	return;
}

module.exports = {
	data,
	execute,
}
