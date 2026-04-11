const {
    SlashCommandBuilder,
    PermissionsBitField,
    ActionRowBuilder,
    StringSelectMenuBuilder
} = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("tickets")
        .setDescription("Envía el panel completo del sistema de tickets"),

    async execute(interaction) {

        if (!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
            return interaction.reply({
                content: "❌ Solo administradores pueden usar este comando.",
                ephemeral: true
            });
        }

        const mensaje = `
@everyone
━━━━━━━━━━━━━━━━━━━━━━
📜 **Reglas para crear un ticket**
- 🚫 No hacer tickets innecesariamente
- 🚫 No hacer spam si no respondemos rápido
━━━━━━━━━━━━━━━━━━━━━━

🌍 **Ayuda**

**🆘 Soporte General**
Si tienes dudas, abre ticket.

**🛒 Compras Web**
Si hiciste una compra y no te llega, abre ticket.

**🎁 Reclamar Premio**
Si ganaste un sorteo y no recibiste tu premio, abre ticket.

**🤝 Alianza**
Si quieres hacer alianza, abre ticket.

━━━━━━━━━━━━━━━━━━━━━━

⛏️ **Soporte**

**🧑‍💻 Hackers**
Si ves jugadores volando o pegando raro, repórtalo.

**⛏️ Grifeo**
Si alguien rompe tus cosas, repórtalo.

**⛏️ Reportar Bug**
Si algo no funciona, repórtalo.

**⛏️ Apelar Sanción**
Si te sancionaron injustamente, abre ticket.

**🛅 Olvidé mi contraseña**
Si tu cuenta tiene una contraseña que no es tuya, repórtalo.
━━━━━━━━━━━━━━━━━━━━━━
        `;

        const menuAyuda = new ActionRowBuilder().addComponents(
            new StringSelectMenuBuilder()
                .setCustomId("menu_ayuda")
                .setPlaceholder("Menú de Ayuda")
                .addOptions(
                    { label: "Soporte General", value: "general", emoji: "🆘" },
                    { label: "Compras Web", value: "compras", emoji: "🛒" },
                    { label: "Reclamar Premio", value: "premio", emoji: "🎁" },
                    { label: "Alianza", value: "alianza", emoji: "🤝" }
                )
        );

        const menuSoporte = new ActionRowBuilder().addComponents(
            new StringSelectMenuBuilder()
                .setCustomId("menu_soporte")
                .setPlaceholder("Menú de Soporte")
                .addOptions(
                    { label: "Hackers", value: "hackers", emoji: "🧑‍💻" },
                    { label: "Grifeo", value: "grifeo", emoji: "⛏️" },
                    { label: "Reportar Bug", value: "bug", emoji: "⛏️" },
                    { label: "Apelar Sanción", value: "apelar", emoji: "⛏️" },
                    { label: "Olvidé mi contraseña", value: "password", emoji: "🔑" }
                )
        );

        await interaction.reply({
            content: "Panel enviado correctamente.",
            ephemeral: true
        });

        await interaction.channel.send({
            content: mensaje,
            components: [menuAyuda, menuSoporte]
        });
    }
};