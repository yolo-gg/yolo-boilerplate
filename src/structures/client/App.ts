import { Client, ClientOptions } from 'eris';
import { readdirSync } from 'fs';
import path from 'path';

export default class YoloClient extends Client {
	commands: Map<string, unknown>;

	constructor(token: string, options?: ClientOptions) {
		super(token, options);
		this.commands = new Map();
	}

	async loadCommands(): Promise<void> {
		const modulesCommands = readdirSync(
			path.join(__dirname, '../../commands')
		);
		modulesCommands.forEach((module) => {
			const commands = readdirSync(
				path.join(__dirname, `../../commands/${module}`)
			);
			commands.forEach(async (cmd) => {
				const Command = await import(
					path.join(__dirname, `../../commands/${module}/${cmd}`)
				);
				const command = new Command.Default(this);

				this.commands.set(command.name, command);
			});
		});
	}

	async loadEvents(): Promise<void> {
		const modulesEvents = readdirSync(path.join(__dirname, '../../events'));
		modulesEvents.forEach((module) => {
			const events = readdirSync(
				path.join(__dirname, `../../events/${module}`)
			);
			events.forEach(async (evnt) => {
				const Event = await import(
					path.join(__dirname, `../../events/${module}/${evnt}`)
				);
				const event = new Event.Default(this);

				this.on(event.name, (...args) => event.on(...args));
			});
		});
	}
}

export const app = new YoloClient(process.env.DISCORD_TOKEN!, {
	allowedMentions: {
		everyone: false,
		roles: false,
		users: true,
		repliedUser: true,
	},
	autoreconnect: true,
	defaultImageSize: 4096,
	defaultImageFormat: 'png',
	restMode: true,
	intents: ['all'],
});
