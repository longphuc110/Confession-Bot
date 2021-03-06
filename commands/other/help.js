const { permLevelToRole, checkPermissions, dbQuery } = require("../../coreFunctions");
const { prefix: defaultPrefix,  } = require("../../config");

module.exports = {
	controls: {
		name: "help",
		permission: 10,
		aliases: ["command", "howto", "prefix"],
		usage: "help (command name)",
		description: "Shows command information",
		enabled: true,
		dmAvailable: true
	},
	do: async (message, client, args, Discord) => {

		let prefix = defaultPrefix;
		if (message.guild) {
			const qServerDB = await dbQuery("Server", {id: message.guild.id});
			prefix = qServerDB.config.prefix;
		}

		let permission = await checkPermissions(message.member || message.author, client);

		if (!args[0]) {
			let embed = new Discord.MessageEmbed()
				.setAuthor(`${client.user.username} Help`, client.user.displayAvatarURL({ format: "png" }))
				.setDescription("Confessions is a bot that allows your server members to submit anonymous confessions!\n[Support](https://discord.gg/GGm6YuX)\n[Premium](https://www.patreon.com/confessionsbot)")
				.addField("General Commands", client.commands.filter(c => c.controls.module === "other").map(c => `\`${prefix}${c.controls.usage}\` - ${c.controls.description}`))
				.setColor("RANDOM");
			if (permission <= 1) embed.addField("Staff Commands", client.commands.filter(c => c.controls.module === "server staff").map(c => `\`${prefix}${c.controls.usage}\` - ${c.controls.description}`));
			if (permission === 0) embed.addField("Bot Admin Commands", client.commands.filter(c => c.controls.module === "admin").map(c => `\`${prefix}${c.controls.usage}\` - ${c.controls.description}`));

			return message.channel.send(embed);
		}

		let commandName = args[0].toLowerCase();

		const command = client.commands.find((c) => c.controls.name.toLowerCase() === commandName || c.controls.aliases && c.controls.aliases.includes(commandName));

		if (!command) return;

		let commandInfo = command.controls;

		let returnEmbed = new Discord.MessageEmbed()
			.setColor("RANDOM")
			.setDescription(commandInfo.description)
			.addField("Permission Level", permLevelToRole(commandInfo.permission), true)
			.addField("Usage", `\`${prefix}${commandInfo.usage}\``, true)
			.setAuthor(`Command: ${commandName}`, client.user.displayAvatarURL({dynamic: true, format: "png"}));

		commandInfo.aliases ? returnEmbed.addField(commandInfo.aliases.length > 1 ? "Aliases" : "Alias", commandInfo.aliases.join(", ")) : "";
		if (!commandInfo.enabled) returnEmbed.addField("Additional Information", "⚠️ This command is currently disabled");

		return message.channel.send(returnEmbed);

	}
};
