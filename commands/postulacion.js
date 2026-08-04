const { 
    SlashCommandBuilder, 
    EmbedBuilder, 
    ActionRowBuilder, 
    ButtonBuilder, 
    ButtonStyle 
} = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("postulacion")
        .setDescription("Mostrar el panel de postulación del Staff de BloqueMágico")
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
            .setTitle("🪄 BloqueMágico | Postulaciones para el Staff Team")
            .setColor("#9E00FF")
            .setDescription(
                "🔮 **¿Qué buscamos en BloqueMágico?**\n\n" +
                "> En BloqueMágico buscamos personas con experiencia en **Minecraft**, que conozcan sus **mecánicas**, que sepan **resolver conflictos rápido**, y que tengan **madurez**, **responsabilidad** y **ganas de aprender**.\n\n" +

                "📌 **Requisitos mínimos**\n" +
                "- Tener **13 años o más**.\n" +
                "- Tener un **buen micrófono**.\n" +
                "- Ser **maduro**, **responsable** y **educado**.\n" +
                "- Tener **buena ortografía**.\n\n" +

                "🚀 **¿Eres No-Premium?**\n" +
                "> Ser No-Premium **no es un impedimento** para postularte. Si cumples los requisitos, puedes aplicar.\n" +
                "> **Nota:** Los rangos superiores como *Moderador* solo están disponibles para usuarios Premium.\n\n" +

                `✨ **¿Quieres postularte para el rango de _${rango}_?**\n` +
                "> Pulsa el botón de abajo para iniciar tu postulación."
            );

        const boton = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId(`postu_start_${rango}`)
                .setLabel("📨 Iniciar Postulación")
                .setStyle(ButtonStyle.Primary)
        );

        await interaction.reply({
            embeds: [embed],
            components: [boton]
        });
    }
};
