const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("server")
        .setDescription("Muestra información del servidor"),

    async execute(interaction) {
        const guild = interaction.guild;

        const creado = Math.floor(guild.createdTimestamp / 1000);
        const totalMiembros = guild.memberCount;
        const humanos = guild.members.cache.filter(m => !m.user.bot).size;
        const bots = guild.members.cache.filter(m => m.user.bot).size;

        const embed = new EmbedBuilder()
            .setTitle("🌐 Información del Servidor")
            .setColor("#8A2BE2")
            .setThumbnail(guild.iconURL({ size: 1024 }))
            .addFields(
                { name: "📛 Nombre", value: guild.name, inline: true },
                { name: "🆔 ID", value: guild.id, inline: true },
                {
                    name: "📅 Creado",
                    value: `<t:${creado}:F>\n<t:${creado}:R>`,
                    inline: false
                },
                { name: "👑 Dueño", value: `<@${guild.ownerId}>`, inline: true },
                {
                    name: "👥 Miembros",
                    value: `Total: **${totalMiembros}**
Humanos: **${humanos}**
Bots: **${bots}**`,
                    inline: true
                },
                {
                    name: "📂 Canales",
                    value: `${guild.channels.cache.size}`,
                    inline: true
                },
                {
                    name: "🏷️ Roles",
                    value: `${guild.roles.cache.size}`,
                    inline: true
                },
                {
                    name: "🚀 Boosts",
                    value: `Nivel: **${guild.premiumTier}**
Boosts: **${guild.premiumSubscriptionCount}**`,
                    inline: true
                }
            )
            .setFooter({ text: "BloqueMágico | Network" })
            .setTimestamp();

        return interaction.reply({ embeds: [embed] });
    }
};