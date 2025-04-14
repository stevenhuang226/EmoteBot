const { redisClient } = require('redis.js');
const { config } = require('./config/config.js');
const emoteGroupName = 'emote';


const redis = new redisClient({url: config.redisUrl});

/*
 * redisStart
 *
 * run before start using redis
 */
async function redisStart() {
	await redis.connect();
}

/*
 * redisEmoteAdd
 * variable: name(string): emote's name
 * 	path(string): where is emote's git/jpg... located
 *
 * no return
 */
async function redisEmoteAdd(name, path) {
	if (redisEmoteNameCheck(name)) {
		console.log(`./redis/client.js: redisEmoteRemove\n${name} had exists, cannot add !!!`);
	}
	await redis.set(`${emoteGroupName}:${name}`, path);
	await redis.zAdd(emoteGroupName, {score: 0, value: name});
}

/*
 * redisEmoteRemove
 * variable: name(string): the emote's name want to remove
 *
 * no return, but will log error
 */
async function redisEmoteRemove(name) {
	if (! redisEmoteNameCheck(name)) {
		console.log(`./redis/client.js: redisEmoteRemove\n${name} not exists, cannot remove !!!`);
		return;
	}
	await redis.del(`${emoteGroupName}:${name}`);
	await redis.zRem(emoteGroupName, name);
}

/*
 * redisEmotePrefixSearch
 * variable: prefix(string): prefix to search
 * 	limit(int): limit for maximum return size
 *
 * return a array of {key, value} that key match the prefix
 */
async function redisEmotePrefixSearch(prefix, limit = 25) {
	const matched = await redis.zRangeByLex(emoteGroupName, `[${prefix}`, `[${prefix}\uffff`, 0, limit);
	return matched;
}

/*
 * redisEmoteGet
 * variable: name: key
 *
 * function will auto check key exists or not, if not it will return "Error"
 * return a object include key and value
 */
async function redisEmoteGet(name) {
	if (! redisEmoteNameCheck(name)) return 'Error';
	return redis.get(name);
}

/* 
 * redisEmoteNameCheck
 * variable: name(string): the key's name want to check is exists or not
 *
 * if exists => true; else => false
 */
async function redisEmoteNameCheck(name) {
	const exists = redis.exists(`${emoteGroupName}:${name}`);
	if (exists) return true;
	return false;
}

module.exports {
	redisEmoteAdd,
	redisEmoteRemove,
	redisEmotePrefixSearch,
	redisEmoteNameCheck,
}
