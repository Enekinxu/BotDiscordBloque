const { EmbedBuilder } = require("discord.js");
const welcomer = require("../utils/welcomer.js");

module.exports = {
    name: "guildMemberAdd",

    async execute(client, miembro) {
        const canalID = welcomer.obtenerCanal();
        if (!canalID) return;

        const canal = miembro.guild.channels.cache.get(canalID);
        if (!canal) return;

        const embed = new EmbedBuilder()
            .setTitle("🎉 ¡Bienvenido a BloqueMágico!")
            .setColor("#8A2BE2")
            .setThumbnail(miembro.user.displayAvatarURL({ size: 1024 }))
            .setDescription(
`✨ ¡Hola ${miembro}!
Bienvenido al reino mágico de **BloqueMágico | Network**.

🪄 Esperamos que disfrutes tu estancia.
📜 Lee las reglas y únete a la aventura.`
            )
            .setTimestamp();

        canal.send({ embeds: [embed] });
    }
};