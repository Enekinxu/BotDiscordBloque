const fs = require("fs");
const sistemaTickets = require("../tickets/system.js");
const sorteos = require("../utils/sorteos.js");
const { 
    EmbedBuilder, 
    PermissionsBitField,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle
} = require("discord.js");

module.exports = {
    name: "interactionCreate",

    async execute(client, interaction) {

        // ---------------------------------------------------------
        // SLASH COMMANDS
        // ---------------------------------------------------------
        if (interaction.isChatInputCommand()) {
            const comando = client.commands.get(interaction.commandName);
            if (!comando) return;

            try {
                await comando.execute(interaction, client);
            } catch (error) {
                console.error("Error ejecutando comando:", error);
                return interaction.reply({
                    content: "❌ Ocurrió un error ejecutando el comando.",
                    ephemeral: true
                });
            }
        }

        // ---------------------------------------------------------
        // BOTÓN PARA EMPEZAR POSTULACIÓN (MD)
        // ---------------------------------------------------------
        if (interaction.isButton() && interaction.customId.startsWith("postu_start_")) {

            const rango = interaction.customId.split("_")[2];

            const preguntas = [
                "1. ¿Cuál es tu nick de Discord?",
                "2. ¿Cuál es tu nick de Minecraft?",
                "3. ¿Has sido sancionado antes?",
                "4. ¿Cuántos años tienes?",
                "5. ¿Eres Premium o No-Premium?",
                "6. ¿Alguien más tiene acceso a tus cuentas?",
                "7. ¿Cuál es tu zona horaria?",
                "8. ¿Tienes buen micrófono?",
                "9. ¿Cuántas horas semanales puedes dedicar?",
                "10. ¿Experiencia como staff?",
                "11. ¿Qué idiomas sabes?",
                "12. Experiencia en SS y nota del 1–10",
                "13. Diferencia entre Flood y Spam",
                "14. ¿Qué harías si ves un staff corrupto?",
                "15. ¿Qué harías si encuentras un xRayer?",
                "16. Fortalezas y debilidades",
                "17. ¿Por qué quieres ser staff?",
                "18. ¿Por qué deberíamos escogerte?",
                "19. Algo que quieras agregar"
            ];

            // Intentar enviar MD
            try {
                await interaction.user.send({
                    embeds: [
                        new EmbedBuilder()
                            .setTitle("📨 Postulación del Staff")
                            .setDescription(
                                "Responde **cada pregunta** enviando un mensaje.\n\n" +
                                preguntas.map(p => `• ${p}`).join("\n")
                            )
                            .setColor("Purple")
                    ]
                });

                await interaction.reply({
                    content: "📬 Te he enviado un mensaje privado con todas las preguntas.",
                    ephemeral: true
                });

            } catch (err) {
                return interaction.reply({
                    content: "❌ No puedo enviarte MD. Activa tus mensajes privados.",
                    ephemeral: true
                });
            }

            // Crear archivo temporal
            const archivo = `./postu_${interaction.user.id}.json`;
            fs.writeFileSync(archivo, JSON.stringify({ rango }, null, 4));

            // Collector en MD
            const dmChannel = await interaction.user.createDM();
            let index = 1;

            // Función que envía la siguiente pregunta
            async function preguntarSiguiente() {

                if (index > preguntas.length) {
                    finalizarPostulacion();
                    return;
                }

                await dmChannel.send(`✏️ **Pregunta ${index}:**\n${preguntas[index - 1]}`);

                const collector = dmChannel.createMessageCollector({
                    filter: m => m.author.id === interaction.user.id,
                    max: 1,
                    time: 600000
                });

                collector.on("collect", msg => {
                    let data = JSON.parse(fs.readFileSync(archivo));
                    data[index] = msg.content;
                    fs.writeFileSync(archivo, JSON.stringify(data, null, 4));

                    index++;
                    preguntarSiguiente();
                });

                // Sin mensaje de tiempo agotado
                collector.on("end", () => {});
            }

            // Función final
            async function finalizarPostulacion() {
                if (!fs.existsSync(archivo)) {
                    return dmChannel.send("❌ No se encontró la postulación. Inicia de nuevo.").catch(() => null);
                }

                const data = JSON.parse(fs.readFileSync(archivo));

                const embedFinal = new EmbedBuilder()
                    .setTitle(`📨 Nueva Postulación (${data.rango})`)
                    .setColor("Green")
                    .setDescription(`Postulación enviada por <@${interaction.user.id}>`)
                    .addFields(
                        Object.keys(data)
                            .filter(k => k !== "rango")
                            .map(k => ({
                                name: `Pregunta ${k}`,
                                value: data[k].slice(0, 1020)
                            }))
                    )
                    .setTimestamp();

                const canal = interaction.guild.channels.cache.get("1533477230838157332")
                    || await interaction.guild.channels.fetch("1533477230838157332").catch(() => null);

                if (!canal) {
                    await dmChannel.send("❌ No se pudo entregar la postulación: canal no encontrado.");
                    if (fs.existsSync(archivo)) fs.unlinkSync(archivo);
                    return;
                }

                // BOTONES ACEPTAR / RECHAZAR
                const botones = new ActionRowBuilder().addComponents(
                    new ButtonBuilder()
                        .setCustomId(`aceptar_${interaction.user.id}`)
                        .setLabel("Aceptar")
                        .setStyle(ButtonStyle.Success),

                    new ButtonBuilder()
                        .setCustomId(`rechazar_${interaction.user.id}`)
                        .setLabel("Rechazar")
                        .setStyle(ButtonStyle.Danger)
                );

                await canal.send({
                    embeds: [embedFinal],
                    components: [botones]
                });

                fs.unlinkSync(archivo);

                dmChannel.send("✔ Tu postulación ha sido enviada correctamente.");
            }

            // Iniciar preguntas
            preguntarSiguiente();
            return;
        }

        // ---------------------------------------------------------
        // BOTONES ACEPTAR / RECHAZAR
        // ---------------------------------------------------------
        if (interaction.isButton()) {

            // ACEPTAR
            if (interaction.customId.startsWith("aceptar_")) {
                const userId = interaction.customId.split("_")[1];

                try {
                    const usuario = await interaction.guild.members.fetch(userId);
                    await usuario.send("📢 Tu postulación ha sido **aceptada**. ¡Bienvenido al staff!");
                } catch (err) {
                    console.log("No se pudo enviar MD al usuario aceptado.");
                }

                return interaction.reply({
                    content: "✔ Acción realizada.",
                    ephemeral: true
                });
            }

            // RECHAZAR
            if (interaction.customId.startsWith("rechazar_")) {
                const userId = interaction.customId.split("_")[1];

                try {
                    const usuario = await interaction.guild.members.fetch(userId);
                    await usuario.send("📢 Tu postulación ha sido **rechazada**. Gracias por participar.");
                } catch (err) {
                    console.log("No se pudo enviar MD al usuario rechazado.");
                }

                return interaction.reply({
                    content: "✔ Acción realizada.",
                    ephemeral: true
                });
            }
        }

        // ---------------------------------------------------------
        // TICKETS
        // ---------------------------------------------------------
        if (interaction.isButton()) {

            if (interaction.customId === "cerrar_ticket") {
                return sistemaTickets.cerrarTicket(interaction);
            }

            if (interaction.customId === "reclamar_ticket") {
                return interaction.reply({
                    content: `🎟️ Ticket reclamado por ${interaction.user}.`
                });
            }
        }

        // ---------------------------------------------------------
        // SORTEOS
        // ---------------------------------------------------------
        if (interaction.isButton()) {

            const dataSorteo = sorteos.obtener(interaction.message.id);
            if (!dataSorteo) return;

            if (interaction.customId === "participar") {
                if (!dataSorteo.participantes.includes(interaction.user.id)) {
                    dataSorteo.participantes.push(interaction.user.id);
                    return interaction.reply({ content: "🎉 Participación registrada.", ephemeral: true });
                }
                return interaction.reply({ content: "Ya estás participando.", ephemeral: true });
            }

            if (interaction.customId === "finalizar") {
                if (!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
                    return interaction.reply({ content: "❌ No tienes permisos.", ephemeral: true });
                }

                await sorteos.finalizar(interaction.guild, interaction.message, dataSorteo);
                return interaction.reply({ content: "Sorteo finalizado.", ephemeral: true });
            }
        }

        // ---------------------------------------------------------
        // MENÚS DE TICKETS
        // ---------------------------------------------------------
        if (interaction.isStringSelectMenu()) {
            const tipo = interaction.values[0];
            return sistemaTickets.crearTicket(interaction, tipo);
        }
    }
};
