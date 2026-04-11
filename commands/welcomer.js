const { SlashCommandBuilder, PermissionsBitField } = require("discord.js");
const fs = require("fs");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("welcomer")
        .setDescription("Configura el sistema de bienvenida")
        .addSubcommand(sub =>
            sub
                .setName("set")
                .setDescription("Selecciona el canal donde se enviarán las bienvenidas")
                .addChannelOption(option =>
                    option
                        .setName("canal")
                        .setDescription("Canal donde se enviarán los mensajes de bienvenida")
                        .setRequired(true)
                )
        ),

    async execute(interaction) {
        if (!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
            return interaction.reply({
                content: "❌ Solo administradores pueden configurar el welcomer.",
                ephemeral: true
            });
        }

        const canal = interaction.options.getChannel("canal");

        const data = { canal: canal.id };
        fs.writeFileSync("./welcomer.json", JSON.stringify(data, null, 4));

        return interaction.reply({
            content: `✅ Canal de bienvenida configurado en: <#${canal.id}>`,
            ephemeral: true
        });
    }
};