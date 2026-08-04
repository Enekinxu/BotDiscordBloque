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
        // ARCHIVO DE ESTADO DE POSTULACIONES
        // ---------------------------------------------------------
        const estadoPath = "./postulaciones_estado.json";
        if (!fs.existsSync(estadoPath)) {
            fs.writeFileSync(estadoPath, JSON.stringify({ abiertas: true }, null, 4));
        }
        let estado = JSON.parse(fs.readFileSync(estadoPath));

        // ---------------------------------------------------------
        // BOTONES ABRIR / CERRAR POSTULACIONES
        // ---------------------------------------------------------
        if (interaction.isButton()) {

            if (interaction.customId === "cerrar_postulaciones") {
                estado.abiertas = false;
                fs.writeFileSync(estadoPath, JSON.stringify(estado, null, 4));

                return interaction.reply({
                    content: "🔒 Las postulaciones han sido **cerradas**.",
                    ephemeral: true
                });
            }

            if (interaction.customId === "abrir_postulaciones") {
                estado.abiertas = true;
                fs.writeFileSync(estadoPath, JSON.stringify(estado, null, 4));

                const registroPath = "./postulados.json";
                if (fs.existsSync(registroPath)) fs.unlinkSync(registroPath);

                return interaction.reply({
                    content: "🔓 Las postulaciones han sido **abiertas**. Todos pueden postular de nuevo.",
                    ephemeral: true
                });
            }
        }

        // ---------------------------------------------------------
        // BOTÓN PARA EMPEZAR POSTULACIÓN
        // ---------------------------------------------------------
        if (interaction.isButton() && interaction.customId.startsWith("postu_start_")) {

            if (!estado.abiertas) {
                return interaction.reply({
                    content: "❌ Las postulaciones están cerradas actualmente.",
                    ephemeral: true
                });
            }

            const rango = interaction.customId.split("_")[2];

            const registroPath = "./postulados.json";
            let registrados = [];

            if (fs.existsSync(registroPath)) {
                registrados = JSON.parse(fs.readFileSync(registroPath));
            }

            if (registrados.includes(interaction.user.id)) {
                return interaction.reply({
                    content: "❌ Ya has enviado una postulación. No puedes repetirla.",
                    ephemeral: true
                });
            }

            registrados.push(interaction.user.id);
            fs.writeFileSync(registroPath, JSON.stringify(registrados, null, 4));

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

            const archivo = `./postu_${interaction.user.id}.json`;
            fs.writeFileSync(archivo, JSON.stringify({ rango }, null, 4));

            const dmChannel = await interaction.user.createDM();
            let index = 1;

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

                    const respuesta = msg.content.toLowerCase().trim();

                    // -------------------------------
                    // ANTI-RESPUESTAS BASURA
                    // -------------------------------

                    // Demasiado corta
                    if (respuesta.length < 3) {
                        return dmChannel.send("❌ Esa respuesta no es válida. Responde correctamente.")
                            .catch(() => null);
                    }

                    // Solo consonantes
                    if (/^[bcdfghjklmnpqrstvwxyz]+$/i.test(respuesta)) {
                        return dmChannel.send("❌ Esa respuesta no es válida. Responde correctamente.")
                            .catch(() => null);
                    }

                    // Solo vocales
                    if (/^[aeiou]+$/i.test(respuesta)) {
                        return dmChannel.send("❌ Esa respuesta no es válida. Responde correctamente.")
                            .catch(() => null);
                    }

                    // Teclado smash sin espacios
                    if (respuesta.length > 10 && !respuesta.includes(" ")) {
                        return dmChannel.send("❌ Esa respuesta no es válida. Responde correctamente.")
                            .catch(() => null);
                    }

                    // Caracteres raros
                    if (!/^[a-zA-Záéíóúñ\s]+$/.test(respuesta)) {
                        return dmChannel.send("❌ Esa respuesta no es válida. Responde correctamente.")
                            .catch(() => null);
                    }

                    // Guardar respuesta válida
                    let data = JSON.parse(fs.readFileSync(archivo));
                    data[index] = msg.content;
                    fs.writeFileSync(archivo, JSON.stringify(data, null, 4));

                    index++;
                    preguntarSiguiente();
                });

                collector.on("end", () => {});
            }

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

            preguntarSiguiente();
            return;
        }

        // ---------------------------------------------------------
        // BOTONES ACEPTAR / RECHAZAR
        // ---------------------------------------------------------
        if (interaction.isButton()) {

            if (interaction.customId.startsWith("aceptar_")) {
                const userId = interaction.customId.split("_")[1];

                try {
                    const usuario = await interaction.guild.members.fetch(userId);
                    await usuario.send("📢 Tu postulación ha sido **aceptada**. ¡Bienvenido al equipo!");
                } catch {}

                return interaction.reply({
                    content: "✔ Acción realizada.",
                    ephemeral: true
                });
            }

            if (interaction.customId.startsWith("rechazar_")) {
                const userId = interaction.customId.split("_")[1];

                try {
                    const usuario = await interaction.guild.members.fetch(userId);
                    await usuario.send("📢 Tu postulación ha sido **rechazada**. Gracias por participar.");
                } catch {}

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
