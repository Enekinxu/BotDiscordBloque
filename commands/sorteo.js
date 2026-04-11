const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");
const sorteos = require("../utils/sorteos.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("sorteo")
        .setDescription("Crea un sorteo de un rango temporal")
        .addStringOption(option =>
            option
                .setName("rango")
                .setDescription("Rango a sortear")
                .setRequired(true)
                .addChoices(
                    { name: "Mago", value: "mago" },
                    { name: "Manacrest", value: "manacrest" },
                    { name: "Arcano", value: "arcano" },
                    { name: "Hechicero", value: "hechicero" },
                    { name: "Aprendiz", value: "aprendiz" }
                )
        ),

    async execute(interaction) {
        const rango = interaction.options.getString("rango");

        const embed = new EmbedBuilder()
            .setTitle("🎉 ¡Sorteo Activo!")
            .setColor("#FFD700")
            .setDescription(`Se sortea **${rango}** durante 1 mes.`);

        const botones = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId("participar")
                .setLabel("Participar 🎉")
                .setStyle(ButtonStyle.Success),

            new ButtonBuilder()
                .setCustomId("finalizar")
                .setLabel("Finalizar Sorteo")
                .setStyle(ButtonStyle.Danger)
        );

        const msg = await interaction.reply({
            embeds: [embed],
            components: [botones],
            fetchReply: true
        });

        sorteos.crearSorteo(msg.id, rango, interaction.user.id);
    }
};