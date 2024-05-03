const fs = require('node:fs');

const ReadFolder = require('./ReadFolder.js');

module.exports = function (client) {
	client.logs.debug('Loading events...');
	if (!fs.existsSync(`${__dirname}/../events/`)) {
		client.logs.warn('Events folder not found, skipping...');
		return;
	}

	const files = ReadFolder('events');
	for (const { path, data } of files) {
		try {
			if (typeof data !== 'function') return client.logs.error(`[EVENTS] Invalid event file: ${path}`);
			client.on(path.split('.')[0], data.bind(null, client));
		} catch (error) {
			client.logs.error(error);
		}
	}
	
	client.logs.success(`Loaded ${files.length} events!`);
}