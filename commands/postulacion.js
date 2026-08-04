const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("postulacion")
        .setDescription("Iniciar postulación para un rango del staff")
        .addStringOption(option =>
            option.setName("rango")
                .setDescription("Rango al que deseas postularte")
                .setRequired(true)
                .addChoices(
                    { name: "Helper", value: "helper" },
                    { name: "Moderador", value: "mod" },
                    { name: "Builder", value: "builder" }
                )
        ),

    async execute(interaction) {

        const rango = interaction.options.getString("rango");

        const embed = new EmbedBuilder()
            .setTitle(`📋 Postulación para ${rango}`)
            .setDescription("Pulsa el botón para comenzar tu postulación en mensajes privados.")
            .setColor("Blue");

        const boton = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId(`postu_start_${rango}`)
                .setLabel("Comenzar Postulación")
                .setStyle(ButtonStyle.Primary)
        );

        await interaction.reply({
            embeds: [embed],
            components: [boton]
        });
    }
};
