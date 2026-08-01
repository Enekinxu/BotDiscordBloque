const fs = require("fs");
const sistemaTickets = require("../tickets/system.js");
const sorteos = require("../utils/sorteos.js");

module.exports = {
    name: "interactionCreate",

    async execute(client, interaction) {

        // ----------------------
        // SLASH COMMANDS
        // ----------------------
        if (interaction.isChatInputCommand()) {
            const comando = client.commands.get(interaction.commandName);
            if (!comando) return;
            return comando.execute(interaction, client);
        }

        // ----------------------
        // BOTÓN PARA ABRIR FORMULARIO DE POSTULACIÓN
        // ----------------------
        if (interaction.isButton()) {

            if (interaction.customId.startsWith("postular_")) {

                const rango = interaction.customId.split("_")[1];

                const {
                    ModalBuilder,
                    TextInputBuilder,
                    TextInputStyle,
                    ActionRowBuilder
                } = require("discord.js");

                const modal = new ModalBuilder()
                    .setCustomId(`formPostulacion_${rango}`)
                    .setTitle(`Postulación para ${rango}`);

                const nombre = new TextInputBuilder()
                    .setCustomId("nombre")
                    .setLabel("Tu nombre")
                    .setStyle(TextInputStyle.Short)
                    .setRequired(true);

                const edad = new TextInputBuilder()
                    .setCustomId("edad")
                    .setLabel("Tu edad")
                    .setStyle(TextInputStyle.Short)
                    .setRequired(true);

                const experiencia = new TextInputBuilder()
                    .setCustomId("experiencia")
                    .setLabel("Experiencia previa")
                    .setStyle(TextInputStyle.Paragraph)
                    .setRequired(true);

                const motivo = new TextInputBuilder()
                    .setCustomId("motivo")
                    .setLabel("¿Por qué quieres ser Helper?")
                    .setStyle(TextInputStyle.Paragraph)
                    .setRequired(true);

                modal.addComponents(
                    new ActionRowBuilder().addComponents(nombre),
                    new ActionRowBuilder().addComponents(edad),
                    new ActionRowBuilder().addComponents(experiencia),
                    new ActionRowBuilder().addComponents(motivo)
                );

                return interaction.showModal(modal);
            }
        }

        // ----------------------
        // FORMULARIO DE POSTULACIÓN
        // ----------------------
        if (interaction.isModalSubmit()) {

            if (interaction.customId.startsWith("formPostulacion_")) {

                const rango = interaction.customId.split("_")[1];

                const nombre = interaction.fields.getTextInputValue("nombre");
                const edad = interaction.fields.getTextInputValue("edad");
                const experiencia = interaction.fields.getTextInputValue("experiencia");
                const motivo = interaction.fields.getTextInputValue("motivo");

                let data = [];
                if (fs.existsSync("./postulaciones.json")) {
                    data = JSON.parse(fs.readFileSync("./postulaciones.json"));
                }

                const nuevaPostulacion = {
                    id: Date.now(),
                    usuario: interaction.user.id,
                    usuarioTag: interaction.user.tag,
                    rango,
                    nombre,
                    edad,
                    experiencia,
                    motivo,
                    estado: "pendiente",
                    fecha: new Date().toISOString()
                };

                data.push(nuevaPostulacion);
                fs.writeFileSync("./postulaciones.json", JSON.stringify(data, null, 4));

                const embed = {
                    title: "📥 Nueva Postulación",
                    color: 0x00ff00,
                    fields: [
                        { name: "👤 Usuario", value: interaction.user.tag },
                        { name: "🎖️ Rango solicitado", value: rango },
                        { name: "📛 Nombre", value: nombre },
                        { name: "🎂 Edad", value: edad },
                        { name: "📚 Experiencia", value: experiencia },
                        { name: "✨ Motivo", value: motivo },
                        { name: "📌 Estado", value: "Pendiente" }
                    ],
                    footer: { text: `ID: ${nuevaPostulacion.id}` },
                    timestamp: new Date()
                };

                const {
                    ActionRowBuilder,
                    ButtonBuilder,
                    ButtonStyle
                } = require("discord.js");

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

                await interaction.channel.send({ embeds: [embed], components: [botones] });

                await interaction.reply({
                    content: "Tu postulación ha sido enviada correctamente.",
                    ephemeral: true
                });

                // LOGS
                const canalLogs = interaction.guild.channels.cache.get("1533020324277387404");
                if (canalLogs) {
                    canalLogs.send({
                        embeds: [
                            {
                                title: "📝 Log de Postulación",
                                color: 0x3498db,
                                fields: [
                                    { name: "Usuario", value: interaction.user.tag },
                                    { name: "Rango", value: rango },
                                    { name: "Estado", value: "Pendiente" }
                                ],
                                timestamp: new Date()
                            }
                        ]
                    });
                }

                return;
            }
        }

        // ----------------------
        // BOTONES DE ACEPTAR / RECHAZAR POSTULACIÓN
        // ----------------------
        if (interaction.isButton()) {

            if (interaction.customId.startsWith("aceptar_") || interaction.customId.startsWith("rechazar_")) {

                const id = interaction.customId.split("_")[1];

                let data = JSON.parse(fs.readFileSync("./postulaciones.json"));
                const postulacion = data.find(p => p.id == id);

                if (!postulacion) {
                    return interaction.reply({
                        content: "❌ No se encontró la postulación.",
                        ephemeral: true
                    });
                }

                postulacion.estado = interaction.customId.startsWith("aceptar")
                    ? "aceptado"
                    : "rechazado";

                fs.writeFileSync("./postulaciones.json", JSON.stringify(data, null, 4));

                const canalLogs = interaction.guild.channels.cache.get("1533020324277387404");

                if (canalLogs) {
                    canalLogs.send({
                        embeds: [
                            {
                                title: "🔧 Cambio de Estado",
                                color: postulacion.estado === "aceptado" ? 0x00ff00 : 0xff0000,
                                fields: [
                                    { name: "Usuario", value: `<@${postulacion.usuario}>` },
                                    { name: "Rango", value: postulacion.rango },
                                    { name: "Nuevo Estado", value: postulacion.estado }
                                ],
                                timestamp: new Date()
                            }
                        ]
                    });
                }

                return interaction.reply({
                    content: `Estado actualizado a **${postulacion.estado}**.`,
                    ephemeral: true
                });
            }
        }

        // ----------------------
        // MENÚS DE TICKETS
        // ----------------------
        if (interaction.isStringSelectMenu()) {
            const tipo = interaction.values[0];
            return sistemaTickets.crearTicket(interaction, tipo);
        }

        // ----------------------
        // BOTONES DE TICKETS
        // ----------------------
        if (interaction.isButton()) {

            if (interaction.customId === "cerrar_ticket") {
                return sistemaTickets.cerrarTicket(interaction);
            }

            if (interaction.customId === "reclamar_ticket") {
                return interaction.reply({
                    content: `🎟️ Ticket reclamado por ${interaction.user}.`,
                    ephemeral: false
                });
            }
        }

        // ----------------------
        // BOTONES DE SORTEOS
        // ----------------------
        if (interaction.isButton()) {

            const data = sorteos.obtener(interaction.message.id);
            if (!data) return;

            if (interaction.customId === "participar") {
                if (!data.participantes.includes(interaction.user.id)) {
                    data.participantes.push(interaction.user.id);
                    return interaction.reply({
                        content: "¡Participación registrada! 🎉",
                        ephemeral: true
                    });
                }
                return interaction.reply({
                    content: "Ya estás participando.",
                    ephemeral: true
                });
            }

            if (interaction.customId === "finalizar") {
                if (!interaction.member.permissions.has("Administrator")) {
                    return interaction.reply({
                        content: "❌ No tienes permisos para finalizar el sorteo.",
                        ephemeral: true
                    });
                }

                await sorteos.finalizar(interaction.guild, interaction.message, data);

                return interaction.reply({
                    content: "Sorteo finalizado manualmente.",
                    ephemeral: true
                });
            }
        }
    }
};
