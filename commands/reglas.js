const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("reglas")
        .setDescription("Muestra las reglas del servidor")
        .addStringOption(option =>
            option
                .setName("tipo")
                .setDescription("Elige qué reglas quieres ver")
                .setRequired(true)
                .addChoices(
                    { name: "Discord", value: "discord" },
                    { name: "Minecraft", value: "minecraft" }
                )
        ),

    async execute(interaction) {
        const tipo = interaction.options.getString("tipo");

        if (tipo === "discord") {
            const embed = new EmbedBuilder()
                .setTitle("📘 Reglas del Servidor de Discord")
                .setColor("#5865F2")
                .setDescription(
`**🛡️ Reglas Generales de Comportamiento**
• Respeta a todos los miembros. No se tolera el acoso, insultos ni discriminación.
• Evita contenido NSFW o sensible.
• No hagas spam ni flood.
• Usa lenguaje adecuado.
• Si hay un problema, contacta al staff.

**🧙 Reglas de Canales de Texto**
• Escribe en el canal correcto.
• Evita usar mayúsculas excesivas.
• Mantén el tema del canal.
• No promociones otros servidores sin permiso.
• No compartas información personal.

**🎙️ Reglas de Canales de Voz**
• Respeta los turnos de palabra.
• No pongas música sin permiso.
• Evita ruidos molestos o micrófono abierto constante.
• No grabes sin permiso.
• Usa nombres adecuados.

**👑 Reglas de Roles y Jerarquía**
• Respeta al staff y sus decisiones.
• No pidas roles especiales sin motivo.
• Los roles se ganan por participación o eventos.
• No abuses de tu rol.

**🎉 Reglas de Eventos y Actividades**
• Sigue las instrucciones del organizador.
• No hagas spoilers si están prohibidos.
• Participa con buena actitud.
• No interrumpas actividades.

**🧵 Reglas de Personalización y Creatividad**
• No robes contenido de otros usuarios.
• Comparte tus creaciones en los canales adecuados.
• Respeta derechos de autor.
• Sé constructivo al dar feedback.

**🔵 Reglas de Seguridad y Protección**
• No compartas enlaces sospechosos.
• Reporta comportamientos extraños al staff.
• No uses multicuentas para evadir sanciones.
• No intentes hackear, raidear o sabotear el servidor.`
                );

            return interaction.reply({ embeds: [embed] });
        }

        if (tipo === "minecraft") {
            const embed = new EmbedBuilder()
                .setTitle("📘 Reglas de Minecraft")
                .setColor("#9E00FF")
                .setDescription(
`📘 Reglas de Minecraft
🛡️ **Reglas Generales del Reino**
• Respeta a todos los jugadores. No se tolera el acoso, insultos ni discriminación.
• No hagas spam ni flood en el chat.
• No uses lenguaje ofensivo o inapropiado.
• No compartas información personal.
• Sigue las instrucciones del staff o moderadores.

🧱 **Reglas de Construcción**
• No destruyas construcciones ajenas (griefing).
• Evita construcciones ofensivas o inapropiadas.
• Respeta las zonas protegidas o temáticas.
• No abuses de redstone que cause lag.

⚔️ **Reglas de PvP y Combate**
• El PvP solo está permitido en zonas habilitadas.
• No hagas spawnkill ni ataques injustos.
• Respeta los duelos y eventos organizados.
• No robes objetos tras matar a alguien sin reglas claras.

💰 **Reglas de Economía y Comercio**
• No estafes a otros jugadores.
• Respeta los precios establecidos en tiendas oficiales.
• No dupliques objetos ni uses bugs para obtener ventaja.
• Usa los canales adecuados para intercambios.

🚫 **Reglas Técnicas y de Seguridad**
• Prohibido el uso de hacks, cheats o mods no autorizados.
• No explotes bugs o glitches del servidor.
• No hagas publicidad de otros servidores.
• Reporta cualquier comportamiento sospechoso al staff.

🎉 **Reglas de Eventos y Actividades**
• Sigue las normas específicas de cada evento.
• No interrumpas ni sabotees actividades comunitarias.
• Participa con buena actitud y espíritu de equipo.`
                );

            return interaction.reply({ embeds: [embed] });
        }
    }
};