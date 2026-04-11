const {
    ChannelType,
    PermissionFlagsBits,
    EmbedBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle
} = require("discord.js");

module.exports = {
    async crearTicket(interaction, tipo) {

        const categoria = interaction.guild.channels.cache.find(
            c => c.name === "TICKETS" && c.type === ChannelType.GuildCategory
        );

        const canal = await interaction.guild.channels.create({
            name: `ticket-${tipo}-${interaction.user.username}`,
            type: ChannelType.GuildText,
            parent: categoria?.id || null,
            permissionOverwrites: [
                {
                    id: interaction.guild.id,
                    deny: [PermissionFlagsBits.ViewChannel]
                },
                {
                    id: interaction.user.id,
                    allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages]
                },
                {
                    id: interaction.client.user.id,
                    allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages]
                }
            ]
        });

        const embed = new EmbedBuilder()
            .setTitle(`🎫 Ticket creado — ${tipo}`)
            .setColor("#9E00FF")
            .setDescription(`Hola <@${interaction.user.id}>, un miembro del staff te atenderá pronto.`)
            .setTimestamp();

        const botones = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId("cerrar_ticket")
                .setLabel("Cerrar Ticket")
                .setStyle(ButtonStyle.Danger)
        );

        await canal.send({
            content: `<@${interaction.user.id}>`,
            embeds: [embed],
            components: [botones]
        });

        await interaction.reply({
            content: `🎫 Ticket creado: ${canal}`,
            ephemeral: true
        });
    },

    async cerrarTicket(interaction) {
        await interaction.reply("🗑️ Cerrando ticket en 5 segundos...");
        setTimeout(() => interaction.channel.delete(), 5000);
    }
};