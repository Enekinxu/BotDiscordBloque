const fs = require("fs");
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
        .setDescription("Enviar una postulación eligiendo un rango")
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

        // Cargar postulaciones
        let data = [];
        if (fs.existsSync("./postulaciones.json")) {
            data = JSON.parse(fs.readFileSync("./postulaciones.json"));
        }

        // Crear postulación
        const nuevaPostulacion = {
            id: Date.now(),
            usuario: interaction.user.id,
            usuarioTag: interaction.user.tag,
            rango,
            estado: "pendiente",
            fecha: new Date().toISOString()
        };

        data.push(nuevaPostulacion);

        fs.writeFileSync("./postulaciones.json", JSON.stringify(data, null, 4));

        // Embed
        const embed = new EmbedBuilder()
            .setTitle("📥 Nueva Postulación")
            .setColor(0x00ff00)
            .addFields(
                { name: "👤 Usuario", value: interaction.user.tag },
                { name: "🎖️ Rango solicitado", value: rango },
                { name: "📌 Estado", value: "Pendiente" }
            )
            .setFooter({ text: `ID: ${nuevaPostulacion.id}` })
            .setTimestamp();

        // Botones
        const botones = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId(`aceptar_${nuevaPostulacion.id}`)
                .setLabel("Aceptar")
                .setStyle(ButtonStyle.Success),

            new ButtonBuilder()
                .setCustomId(`rechazar_${nuevaPostulacion.id}`)
                .setLabel("Rechazar")
                .setStyle(ButtonStyle.Danger)
        );

        // Enviar en el canal donde se ejecutó el comando
        await interaction.channel.send({ embeds: [embed], components: [botones] });

        // Respuesta al usuario
        await interaction.reply({
            content: `Tu postulación para **${rango}** ha sido enviada.`,
            ephemeral: true
        });

        // LOGS AUTOMÁTICOS
        const canalLogs = interaction.guild.channels.cache.get("ID_DEL_CANAL_DE_LOGS");
        if (canalLogs) {
            canalLogs.send({
                embeds: [
                    new EmbedBuilder()
                        .setTitle("📝 Log de Postulación")
                        .setColor(0x3498db)
                        .setDescription(`Nueva postulación creada.`)
                        .addFields(
                            { name: "Usuario", value: interaction.user.tag },
                            { name: "Rango", value: rango },
                            { name: "Estado", value: "Pendiente" }
                        )
                        .setTimestamp()
                ]
            });
        }
    }
};
