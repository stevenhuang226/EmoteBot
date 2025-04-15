const { createClient } = require('redis');
const config = require(`../../config/config.js`);
const emoteGroupName = 'emote';


const redis = createClient({url: config.redisUrl});

/*
 * redisStart
 *
 * run before start using redis
 */
async function redisStart() {
	await redis.connect();
}
/* 
 * redisClose
 */
async function redisClose() {
	await redis.disconnect();
}

/*
 * redisEmoteAdd
 * variable: name(string): emote's name
 * 	path(string): where is emote's git/jpg... located
 *
 * no return
 */
async function redisEmoteAdd(name, path) {
	if (await redisEmoteNameCheck(name)) {
		console.log(`redis/client.js: redisEmoteRemove\n${name} had exists, cannot add !!!`);
		return -1;
	}
	await redis.set(`${emoteGroupName}:${name}`, path);
	await redis.zAdd(emoteGroupName, {score: 0, value: name});
	return 0;
}

/*
 * redisEmoteRemove
 * variable: name(string): the emote's name want to remove
 *
 * no return, but will log error
 */
async function redisEmoteRemove(name) {
	if (! await redisEmoteNameCheck(name)) {
		console.log(`redis/client.js: redisEmoteRemove\n${name} not exists, cannot remove !!!`);
		return -1;
	}
	await redis.del(`${emoteGroupName}:${name}`);
	await redis.zRem(emoteGroupName, name);
	return 0;
}

/*
 * redisEmotePrefixSearch
 * variable: prefix(string): prefix to search
 * 	limit(int): limit for maximum return size
 *
 * return a array of {key, value} that key match the prefix,
 * if there is not data or error, return a zero array
 */
async function redisEmotePrefixSearch(prefix, limit = 25) {
	const matched = await redis.zRange(emoteGroupName, `[${prefix}`, `[${prefix}\uffff`, {
		BY: 'LEX',
		LIMIT: {
			offset: 0,
			count: limit
		}
	});
	return matched || [];
}

/*
 * redisEmoteGet
 * variable: name: key
 *
 * function will auto check key exists or not, if not it will return "Error"
 * return a object include key and value
 */
async function redisEmoteGet(name) {
	if (! redisEmoteNameCheck(name)) {
		return 'Error'
	}
	return await redis.get(`${emoteGroupName}:${name}`);
}

/* 
 * redisEmoteNameCheck
 * variable: name(string): the key's name want to check is exists or not
 *
 * if exists => true; else => false
 */
async function redisEmoteNameCheck(name) {
	const exists = await redis.exists(`${emoteGroupName}:${name}`);
	if (exists) return true;
	return false;
}

module.exports = {
	redisStart,
	redisClose,
	redisEmoteAdd,
	redisEmoteRemove,
	redisEmotePrefixSearch,
	redisEmoteNameCheck,
	redisEmoteGet
}
