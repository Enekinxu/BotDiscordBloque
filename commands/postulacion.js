const {
    SlashCommandBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle
} = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("postulacion")
        .setDescription("Iniciar una postulación")
        .addStringOption(option =>
            option.setName("rango")
                .setDescription("Rango al que quieres postularte")
                .setRequired(true)
                .addChoices(
                    { name: "Helper", value: "Helper" },
                    { name: "Moderador", value: "Moderador" },
                    { name: "Admin", value: "Admin" }
                )
        ),

    async execute(interaction) {

        const rango = interaction.options.getString("rango");

        // Botón para iniciar la postulación
        const boton = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId(`postular_${rango}`)
                .setLabel(`Postularse a ${rango}`)
                .setStyle(ButtonStyle.Primary)
        );

        await interaction.reply({
            content: `Haz clic para postularte a **${rango}**`,
            components: [boton],
            ephemeral: false
        });
    }
};
