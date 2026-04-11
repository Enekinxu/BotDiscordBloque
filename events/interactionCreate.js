const sistemaTickets = require("../tickets/system.js");
const sorteos = require("../utils/sorteos.js");

module.exports = {
    name: "interactionCreate",

    async execute(client, interaction) {

        // SLASH COMMANDS
        if (interaction.isChatInputCommand()) {
            const comando = client.commands.get(interaction.commandName);
            if (!comando) return;
            return comando.execute(interaction, client);
        }

        // MENÚS DE TICKETS
        if (interaction.isStringSelectMenu()) {
            const tipo = interaction.values[0];
            return sistemaTickets.crearTicket(interaction, tipo);
        }

        // BOTONES DE TICKETS
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

        // BOTONES DE SORTEOS
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