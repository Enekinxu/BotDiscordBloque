const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("panelpostulaciones")
        .setDescription("Envía el panel para abrir o cerrar postulaciones")
        .addChannelOption(option =>
            option.setName("canal")
                .setDescription("Canal donde se enviará el panel")
                .setRequired(true)
        ),

    async execute(interaction) {

        const canal = interaction.options.getChannel("canal");

        const embed = new EmbedBuilder()
            .setTitle("⚙️ Panel de Postulaciones")
            .setDescription("Controla si las postulaciones están **abiertas** o **cerradas**.")
            .setColor("Blue");

        const botones = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId("abrir_postulaciones")
                .setLabel("Abrir Postulaciones")
                .setStyle(ButtonStyle.Success),

            new ButtonBuilder()
                .setCustomId("cerrar_postulaciones")
                .setLabel("Cerrar Postulaciones")
                .setStyle(ButtonStyle.Danger)
        );

        await canal.send({
            embeds: [embed],
            components: [botones]
        });

        await interaction.reply({
            content: "✔ Panel enviado correctamente.",
            ephemeral: true
        });
    }
};
