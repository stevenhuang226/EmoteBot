const { SlashCommandBuilder } = require('discord.js');
//const urlChecker = require('../utils/urlCheck.js');
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
//		opt.setName('d2s')
//			.setDescription('download to server')
//			.setRequired(false)
//			.setAutocomplete(false)

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
	/*
	if (await redis.redisEmoteNameCheck(name)) {
		await interaction.editReply({
			content: `unexpect error, add name: ${name}; url: ${source} failed`,
			ephemeral: true,
		});
		return;
	}
	*/

	/*
	const check = await urlChecker.urlImageCheckExists(source)
	if (check === [true,true]) {
		return;
	}
	if (check[0] === false) {
		await interaction.editReply({
			content: 'warring: url source does not exists',
			ephemeral: true,
		});
	}
	if (check[1] === false) {
		await interaction.editReply({
			content: 'warring: url source not a image',
			ephemeral: true,
		});
	}
	*/
}

module.exports = {
	data,
	execute,
}
