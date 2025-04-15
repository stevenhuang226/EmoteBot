const { request } = require('undici');

async function urlImageCheckExists(url) {
	imageStatus = [false, false];
	const { statusCode, headers } = await request(url, { method: 'HEAD' });
	if (statusCode !== 200) imageStatus[0] = true;
	if (headers['content-type']?.startWith('image/')) imageStatus[1] = true;

	return imageStatus;
}

module.exports = {
	urlImageCheckExists,
};
