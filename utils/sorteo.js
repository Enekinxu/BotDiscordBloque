const { EmbedBuilder } = require("discord.js");

// Colección en memoria
const sorteos = new Map();

// Roles configurados
const roles = {
    aprendiz: "1456327766617227284",
    hechicero: "1456587191164862555",
    arcano: "1456587467963629613",
    manacrest: "1456588261966348435",
    mago: "1456327931981729855"
};

module.exports = {
    // Crear sorteo
    crearSorteo(messageId, rango, autor) {
        sorteos.set(messageId, {
            participantes: [],
            rango,
            autor
        });
    },

    // Obtener sorteo
    obtener(messageId) {
        return sorteos.get(messageId);
    },

    // Finalizar sorteo
    async finalizar(guild, message, data) {
        if (data.participantes.length === 0) {
            await message.reply("❌ No hubo participantes.");
            sorteos.delete(message.id);
            return;
        }

        const ganador = data.participantes[Math.floor(Math.random() * data.participantes.length)];

        const rolID = roles[data.rango];
        const rol = guild.roles.cache.get(rolID);

        if (!rol) {
            await message.reply("❌ El rol configurado NO existe.");
            return;
        }

        const miembro = await guild.members.fetch(ganador);
        await miembro.roles.add(rol);

        // Quitar rol después de 30 días
        setTimeout(async () => {
            await miembro.roles.remove(rol).catch(() => {});
        }, 30 * 24 * 60 * 60 * 1000);

        const embedGanador = new EmbedBuilder()
            .setTitle("🎉 ¡Ganador del Sorteo!")
            .setColor("#00FF00")
            .setDescription(`🏆 <@${ganador}> ha ganado **${data.rango}** durante 1 mes.`);

        await message.reply({ embeds: [embedGanador] });

        sorteos.delete(message.id);
    }
};
