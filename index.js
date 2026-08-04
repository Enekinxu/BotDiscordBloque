require("dotenv").config();
const fs = require("fs");
const express = require("express");

// Discord.js v14
const {
    Client,
    GatewayIntentBits,
    Partials,
    REST,
    Routes,
    Collection
} = require("discord.js");

// ----------------------
// CLIENTE DEL BOT (v14)
// ----------------------
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.DirectMessages   // ← NECESARIO PARA RECIBIR MD
    ],
    partials: [
        Partials.Channel,   // ← NECESARIO PARA MD
        Partials.Message,
        Partials.User
    ]
});

client.commands = new Collection();

// ----------------------
// CARGAR COMANDOS
// ----------------------
const comandos = [];
const commandFiles = fs.readdirSync("./commands").filter(f => f.endsWith(".js"));

for (const file of commandFiles) {
    const cmd = require(`./commands/${file}`);
    client.commands.set(cmd.data.name, cmd);
    comandos.push(cmd.data.toJSON());
}

// ----------------------
// CARGAR SISTEMA DE TICKETS
// ----------------------
client.ticketSystem = require("./tickets/system.js");

// ----------------------
// CARGAR EVENTOS
// ----------------------
const eventFiles = fs.readdirSync("./events").filter(f => f.endsWith(".js"));

for (const file of eventFiles) {
    const event = require(`./events/${file}`);

    if (event.once) {
        client.once(event.name, (...args) => event.execute(client, ...args));
    } else {
        client.on(event.name, (...args) => event.execute(client, ...args));
    }
}

// ----------------------
// API EXPRESS PARA DASHBOARD
// ----------------------
const app = express();
app.use(express.json());

// Enviar canales al dashboard
app.get("/channels/:guildId", (req, res) => {
    const guild = client.guilds.cache.get(req.params.guildId);
    if (!guild) return res.json([]);

    const channels = guild.channels.cache
        .filter(ch => ch.type === 0)
        .map(ch => ({ id: ch.id, name: ch.name }));

    res.json(channels);
});

// Enviar nombre del servidor
app.get("/guild/:guildId", (req, res) => {
    const guild = client.guilds.cache.get(req.params.guildId);
    if (!guild) return res.status(404).json({ error: "Servidor no encontrado" });

    res.json({ id: guild.id, name: guild.name });
});

// Servidores donde está el bot
app.get("/api/servers", (req, res) => {
    const guilds = client.guilds.cache.map(g => g.id);
    res.json(guilds);
});

// ----------------------
// API PARA RECIBIR STREAMERS DESDE EL DASHBOARD
// ----------------------
app.post("/api/addStreamer", (req, res) => {
    const filePath = "./streamers.json";

    let data = [];
    if (fs.existsSync(filePath)) {
        data = JSON.parse(fs.readFileSync(filePath));
    }

    data.push(req.body);

    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));

    res.json({ ok: true, msg: "Streamer guardado en el bot." });
});

// Función para leer streamers
function cargarStreamers() {
    const filePath = "./streamers.json";
    if (!fs.existsSync(filePath)) return [];
    return JSON.parse(fs.readFileSync(filePath));
}

// Ejemplo de función para anunciar
async function anunciarStreamer(streamer) {
    const canal = client.channels.cache.get(streamer.canal);
    if (!canal) return;
    await canal.send(streamer.mensaje);
}

// Puerto API
app.listen(process.env.PORT || 3001, () =>
    console.log("API del bot lista")
);

// ----------------------
// REGISTRO GLOBAL DE COMANDOS (v14)
// ----------------------
client.once("ready", async () => {   // ← ARREGLADO: ANTES TENÍAS "clientReady"
    console.log(`Bot iniciado como ${client.user.tag}`);

    try {
        const rest = new REST({ version: "10" }).setToken(process.env.TOKEN);

        await rest.put(
            Routes.applicationCommands(client.user.id),
            { body: comandos }
        );

        console.log("Comandos globales registrados.");
    } catch (error) {
        console.error(error);
    }
});

// ----------------------
// LOGIN
// ----------------------
client.login(process.env.TOKEN);