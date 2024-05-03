module.exports = {
	name: 'ping',
	description: 'Ping!',
	cooldown: 5,
	execute(message, client, args) {
		message.reply('Pong!');
	}
}