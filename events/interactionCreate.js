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
        // BOTÓN PARA EMPEZAR POSTULACIÓN
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

                // FORMULARIO 1 (preguntas 1–5)
                const modal = new ModalBuilder()
                    .setCustomId(`form1_${rango}`)
                    .setTitle(`Postulación (1/4)`);

                modal.addComponents(
                    new ActionRowBuilder().addComponents(
                        new TextInputBuilder()
                            .setCustomId("nick_discord")
                            .setLabel("1. ¿Cuál es tu nick de Discord?")
                            .setStyle(TextInputStyle.Short)
                            .setRequired(true)
                    ),
                    new ActionRowBuilder().addComponents(
                        new TextInputBuilder()
                            .setCustomId("nick_minecraft")
                            .setLabel("2. ¿Cuál es tu nick de Minecraft?")
                            .setStyle(TextInputStyle.Short)
                            .setRequired(true)
                    ),
                    new ActionRowBuilder().addComponents(
                        new TextInputBuilder()
                            .setCustomId("sancionado")
                            .setLabel("3. ¿Has sido sancionado antes?")
                            .setStyle(TextInputStyle.Short)
                            .setRequired(true)
                    ),
                    new ActionRowBuilder().addComponents(
                        new TextInputBuilder()
                            .setCustomId("edad")
                            .setLabel("4. ¿Cuántos años tienes?")
                            .setStyle(TextInputStyle.Short)
                            .setRequired(true)
                    ),
                    new ActionRowBuilder().addComponents(
                        new TextInputBuilder()
                            .setCustomId("premium")
                            .setLabel("5. ¿Eres Premium o No-Premium?")
                            .setStyle(TextInputStyle.Short)
                            .setRequired(true)
                    )
                );

                return interaction.showModal(modal);
            }
        }

        // ----------------------
        // FORMULARIO 1 → ABRE FORMULARIO 2
        // ----------------------
        if (interaction.isModalSubmit()) {

            if (interaction.customId.startsWith("form1_")) {

                const rango = interaction.customId.split("_")[1];

                const respuestas = {
                    rango,
                    nick_discord: interaction.fields.getTextInputValue("nick_discord"),
                    nick_minecraft: interaction.fields.getTextInputValue("nick_minecraft"),
                    sancionado: interaction.fields.getTextInputValue("sancionado"),
                    edad: interaction.fields.getTextInputValue("edad"),
                    premium: interaction.fields.getTextInputValue("premium")
                };

                fs.writeFileSync(`./temp_${interaction.user.id}.json`, JSON.stringify(respuestas, null, 4));

                const {
                    ModalBuilder,
                    TextInputBuilder,
                    TextInputStyle,
                    ActionRowBuilder
                } = require("discord.js");

                // FORMULARIO 2 (preguntas 6–10)
                const modal = new ModalBuilder()
                    .setCustomId(`form2_${rango}`)
                    .setTitle(`Postulación (2/4)`);

                modal.addComponents(
                    new ActionRowBuilder().addComponents(
                        new TextInputBuilder()
                            .setCustomId("acceso")
                            .setLabel("6. ¿Alguien más tiene acceso a tus cuentas?")
                            .setStyle(TextInputStyle.Short)
                            .setRequired(true)
                    ),
                    new ActionRowBuilder().addComponents(
                        new TextInputBuilder()
                            .setCustomId("zona")
                            .setLabel("7. ¿Cuál es tu zona horaria?")
                            .setStyle(TextInputStyle.Short)
                            .setRequired(true)
                    ),
                    new ActionRowBuilder().addComponents(
                        new TextInputBuilder()
                            .setCustomId("microfono")
                            .setLabel("8. ¿Tienes buen micrófono?")
                            .setStyle(TextInputStyle.Short)
                            .setRequired(true)
                    ),
                    new ActionRowBuilder().addComponents(
                        new TextInputBuilder()
                            .setCustomId("horas")
                            .setLabel("9. ¿Cuántas horas semanales puedes dedicar?")
                            .setStyle(TextInputStyle.Short)
                            .setRequired(true)
                    ),
                    new ActionRowBuilder().addComponents(
                        new TextInputBuilder()
                            .setCustomId("experiencia_staff")
                            .setLabel("10. ¿Experiencia como staff?")
                            .setStyle(TextInputStyle.Paragraph)
                            .setRequired(true)
                    )
                );

                return interaction.showModal(modal);
            }

            // ----------------------
            // FORMULARIO 2 → ABRE FORMULARIO 3
            // ----------------------
            if (interaction.customId.startsWith("form2_")) {

                const rango = interaction.customId.split("_")[1];

                const temp = JSON.parse(fs.readFileSync(`./temp_${interaction.user.id}.json`));

                temp.acceso = interaction.fields.getTextInputValue("acceso");
                temp.zona = interaction.fields.getTextInputValue("zona");
                temp.microfono = interaction.fields.getTextInputValue("microfono");
                temp.horas = interaction.fields.getTextInputValue("horas");
                temp.experiencia_staff = interaction.fields.getTextInputValue("experiencia_staff");

                fs.writeFileSync(`./temp_${interaction.user.id}.json`, JSON.stringify(temp, null, 4));

                const {
                    ModalBuilder,
                    TextInputBuilder,
                    TextInputStyle,
                    ActionRowBuilder
                } = require("discord.js");

                // FORMULARIO 3 (preguntas 11–15)
                const modal = new ModalBuilder()
                    .setCustomId(`form3_${rango}`)
                    .setTitle(`Postulación (3/4)`);

                modal.addComponents(
                    new ActionRowBuilder().addComponents(
                        new TextInputBuilder()
                            .setCustomId("idiomas")
                            .setLabel("11. ¿Qué idiomas sabes?")
                            .setStyle(TextInputStyle.Short)
                            .setRequired(true)
                    ),
                    new ActionRowBuilder().addComponents(
                        new TextInputBuilder()
                            .setCustomId("ss")
                            .setLabel("12. Experiencia en SS y nota del 1–10")
                            .setStyle(TextInputStyle.Short)
                            .setRequired(true)
                    ),
                    new ActionRowBuilder().addComponents(
                        new TextInputBuilder()
                            .setCustomId("flood_spam")
                            .setLabel("13. Diferencia entre Flood y Spam")
                            .setStyle(TextInputStyle.Short)
                            .setRequired(true)
                    ),
                    new ActionRowBuilder().addComponents(
                        new TextInputBuilder()
                            .setCustomId("staff_corrupto")
                            .setLabel("14. ¿Qué harías si ves un staff corrupto?")
                            .setStyle(TextInputStyle.Paragraph)
                            .setRequired(true)
                    ),
                    new ActionRowBuilder().addComponents(
                        new TextInputBuilder()
                            .setCustomId("xrayer")
                            .setLabel("15. ¿Qué harías si encuentras un xRayer?")
                            .setStyle(TextInputStyle.Paragraph)
                            .setRequired(true)
                    )
                );

                return interaction.showModal(modal);
            }

            // ----------------------
            // FORMULARIO 3 → ABRE FORMULARIO 4
            // ----------------------
            if (interaction.customId.startsWith("form3_")) {

                const rango = interaction.customId.split("_")[1];

                const temp = JSON.parse(fs.readFileSync(`./temp_${interaction.user.id}.json`));

                temp.idiomas = interaction.fields.getTextInputValue("idiomas");
                temp.ss = interaction.fields.getTextInputValue("ss");
                temp.flood_spam = interaction.fields.getTextInputValue("flood_spam");
                temp.staff_corrupto = interaction.fields.getTextInputValue("staff_corrupto");
                temp.xrayer = interaction.fields.getTextInputValue("xrayer");

                fs.writeFileSync(`./temp_${interaction.user.id}.json`, JSON.stringify(temp, null, 4));

                const {
                    ModalBuilder,
                    TextInputBuilder,
                    TextInputStyle,
                    ActionRowBuilder
                } = require("discord.js");

                // FORMULARIO 4 (preguntas 16–19)
                const modal = new ModalBuilder()
                    .setCustomId(`form4_${rango}`)
                    .setTitle(`Postulación (4/4)`);

                modal.addComponents(
                    new ActionRowBuilder().addComponents(
                        new TextInputBuilder()
                            .setCustomId("fortalezas")
                            .setLabel("16. Fortalezas y debilidades")
                            .setStyle(TextInputStyle.Paragraph)
                            .setRequired(true)
                    ),
                    new ActionRowBuilder().addComponents(
                        new TextInputBuilder()
                            .setCustomId("razon_staff")
                            .setLabel("17. ¿Por qué quieres ser staff?")
                            .setStyle(TextInputStyle.Paragraph)
                            .setRequired(true)
                    ),
                    new ActionRowBuilder().addComponents(
                        new TextInputBuilder()
                            .setCustomId("escogerte")
                            .setLabel("18. ¿Por qué deberíamos escogerte?")
                            .setStyle(TextInputStyle.Paragraph)
                            .setRequired(true)
                    ),
                    new ActionRowBuilder().addComponents(
                        new TextInputBuilder()
                            .setCustomId("extra")
                            .setLabel("19. Algo que quieras agregar")
                            .setStyle(TextInputStyle.Paragraph)
                            .setRequired(false)
                    )
                );

                return interaction.showModal(modal);
            }

            // ----------------------
            // FORMULARIO 4 → ENVÍA POSTULACIÓN FINAL
            // ----------------------
            if (interaction.customId.startsWith("form4_")) {

                const rango = interaction.customId.split("_")[1];

                const temp = JSON.parse(fs.readFileSync(`./temp_${interaction.user.id}.json`));

                temp.fortalezas = interaction.fields.getTextInputValue("fortalezas");
                temp.razon_staff = interaction.fields.getTextInputValue("razon_staff");
                temp.escogerte = interaction.fields.getTextInputValue("escogerte");
                temp.extra = interaction.fields.getTextInputValue("extra");

                fs.unlinkSync(`./temp_${interaction.user.id}.json`);

                temp.id = Date.now();
                temp.usuario = interaction.user.id;
                temp.usuarioTag = interaction.user.tag;
                temp.estado = "pendiente";
                temp.fecha = new Date().toISOString();

                let data = [];
                if (fs.existsSync("./postulaciones.json")) {
                    data = JSON.parse(fs.readFileSync("./postulaciones.json"));
                }

                data.push(temp);
                fs.writeFileSync("./postulaciones.json", JSON.stringify(data, null, 4));

                // ----------------------
                // EMBEDS PROFESIONALES
                // ----------------------
                const embeds = [
                    {
                        title: "📄 Información básica",
                        color: 0x00ff00,
                        fields: [
                            { name: "Nick Discord", value: temp.nick_discord },
                            { name: "Nick Minecraft", value: temp.nick_minecraft },
                            { name: "Edad", value: temp.edad },
                            { name: "Premium", value: temp.premium },
                            { name: "¿Has sido sancionado?", value: temp.sancionado }
                        ],
                        timestamp: new Date()
                    },
                    {
                        title: "🔐 Seguridad",
                        color: 0x00ff00,
                        fields: [
                            { name: "Acceso a cuentas", value: temp.acceso },
                            { name: "Zona horaria", value: temp.zona },
                            { name: "Micrófono", value: temp.microfono },
                            { name: "Horas semanales", value: temp.horas }
                        ],
                        timestamp: new Date()
                    },
                    {
                        title: "🛡 Experiencia",
                        color: 0x00ff00,
                        fields: [
                            { name: "Experiencia staff", value: temp.experiencia_staff.slice(0, 1020) },
                            { name: "Idiomas", value: temp.idiomas },
                            { name: "Experiencia SS", value: temp.ss },
                            { name: "Flood vs Spam", value: temp.flood_spam }
                        ],
                        timestamp: new Date()
                    },
                    {
                        title: "⚠ Situaciones",
                        color: 0x00ff00,
                        fields: [
                            { name: "Staff corrupto", value: temp.staff_corrupto.slice(0, 1020) },
                            { name: "xRayer", value: temp.xrayer.slice(0, 1020) }
                        ],
                        timestamp: new Date()
                    },
                    {
                        title: "💬 Personal",
                        color: 0x00ff00,
                        fields: [
                            { name: "Fortalezas/debilidades", value: temp.fortalezas.slice(0, 1020) },
                            { name: "Razón para ser staff", value: temp.razon_staff.slice(0, 1020) },
                            { name: "¿Por qué tú?", value: temp.escogerte.slice(0, 1020) },
                            { name: "Extra", value: temp.extra || "N/A" }
                        ],
                        footer: { text: `ID: ${temp.id}` },
                        timestamp: new Date()
                    }
                ];

                const {
                    ActionRowBuilder,
                    ButtonBuilder,
                    ButtonStyle
                } = require("discord.js");

                const botones = new ActionRowBuilder().addComponents(
                    new ButtonBuilder()
                        .setCustomId(`aceptar_${temp.id}`)
                        .setLabel("Aceptar")
                        .setStyle(ButtonStyle.Success),
                    new ButtonBuilder()
                        .setCustomId(`rechazar_${temp.id}`)
                        .setLabel("Rechazar")
                        .setStyle(ButtonStyle.Danger)
                );

                const canalPostulaciones = interaction.guild.channels.cache.get("1533477230838157332");
                if (canalPostulaciones) {
                    await canalPostulaciones.send({ embeds, components: [botones] });
                }

                await interaction.reply({
                    content: "Tu postulación ha sido enviada correctamente.",
                    ephemeral: true
                });

                const canalLogs = interaction.guild.channels.cache.get("1533020324277387404");
                if (canalLogs) {
                    canalLogs.send({
                        embeds: [
                            {
                                title: "📄 Log de Postulación",
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
        // BOTONES DE ACEPTAR / RECHAZAR
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

                try {
                    const usuario = await interaction.guild.members.fetch(postulacion.usuario);

                    usuario.send({
                        embeds: [
                            {
                                title: "📢 Actualización de tu Postulación",
                                color: postulacion.estado === "aceptado" ? 0x00ff00 : 0xff0000,
                                fields: [
                                    { name: "Rango solicitado", value: postulacion.rango },
                                    { name: "Nuevo estado", value: postulacion.estado }
                                ],
                                timestamp: new Date()
                            }
                        ]
                    });
                } catch (err) {
                    console.log("No se pudo enviar MD al usuario.");
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

            // Manejo de los botones de sorteos puede añadirse aquí
        }
    }
};