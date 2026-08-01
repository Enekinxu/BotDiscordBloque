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
        // BOTONES DE POSTULACIONES (ACEPTAR / RECHAZAR)
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

                // Cambiar estado
                postulacion.estado = interaction.customId.startsWith("aceptar")
                    ? "aceptado"
                    : "rechazado";

                fs.writeFileSync("./postulaciones.json", JSON.stringify(data, null, 4));

                // Canal de logs
                const canalLogs = interaction.guild.channels.cache.get("1533020324277387404");

                if (canalLogs) {
                    canalLogs.send({
                        embeds: [
                            {
                                title: "🔧 Cambio de Estado de Postulación",
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
