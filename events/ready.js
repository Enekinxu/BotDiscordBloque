module.exports = {
    name: "ready",
    once: true,

    async execute(client) {
        console.log(`Bot iniciado como ${client.user.tag}`);
    }
};