module.exports = async function filtroGlobal(msg) {

    if (!msg || !msg.content || msg.author.bot) return;

    const original = msg.content;
    let r = msg.content.toLowerCase().trim();

    // -------------------------------
    // LIMPIEZA ULTRA-EXTREMA
    // -------------------------------

    // 1. Zalgo / glitch
    r = r.normalize("NFD").replace(/[\u0300-\u036f\u0489\u1AB0-\u1AFF\u1DC0-\u1DFF\u20D0-\u20FF\uFE20-\uFE2F]/g, "");

    // 2. Espacios invisibles
    r = r.replace(/[\u200B-\u200F\uFEFF]/g, "");

    // 3. Emojis
    r = r.replace(/[^\p{L}\p{N}\s]/gu, "");

    // 4. Símbolos raros
    r = r.replace(/[^a-zA-Z0-9áéíóúñ\s]/g, "");

    // 5. Letras separadas por espacios
    r = r.replace(/\b([a-z])\s([a-z])\b/g, "$1$2");

    // 6. Repeticiones exageradas
    r = r.replace(/(.)\1{2,}/g, "$1");

    // 7. Leet → letras
    r = r
        .replace(/4/g, "a")
        .replace(/1/g, "i")
        .replace(/3/g, "e")
        .replace(/0/g, "o")
        .replace(/7/g, "t")
        .replace(/5/g, "s")
        .replace(/9/g, "g");

    // 8. Unicode invertido
    const unicodeMap = {
        "ꓵ": "u", "ʇ": "t", "ɐ": "a", "ɔ": "c", "ɯ": "m", "ɹ": "r",
        "ʎ": "y", "ʞ": "k", "ʍ": "w", "ʃ": "s", "ʒ": "z"
    };
    r = r.split("").map(ch => unicodeMap[ch] || ch).join("");

    // 9. Texto al revés
    const reversed = r.split("").reverse().join("");

    // -------------------------------
    // DETECCIÓN DE ALFABETOS NO LATINOS
    // -------------------------------

    const tieneCirilico = /[\u0400-\u04FF]/.test(original);
    const tieneJapones = /[\u3040-\u30FF]/.test(original);
    const tieneArabe   = /[\u0600-\u06FF]/.test(original);
    const tieneHebreo  = /[\u0590-\u05FF]/.test(original);

    if (tieneCirilico || tieneJapones || tieneArabe || tieneHebreo) {
        msg.delete().catch(() => {});
        return msg.channel.send(`⚠️ ${msg.author}, tu mensaje contiene texto no permitido.`)
            .catch(() => {});
    }

    // -------------------------------
    // LISTA UNIVERSAL DE INSULTOS
    // -------------------------------

    const insultos = [
        "puta","puto","gilipollas","subnormal","idiota","pendejo","mierda","imbecil","imbécil",
        "retrasado","cabrón","cabron","maricón","maricon","perra","perro","baboso","bobo",
        "hijo de puta","hijoputa","hijo de perra","hijodeperra",

        "fuck","fucker","bitch","asshole","bastard","motherfucker","dumbass","retard",

        "merde","connard","conasse","pute","salope","batard",

        "scheisse","arschloch","fotze","hurensohn",

        "stronzo","coglione","puttana","merda",

        "otário","idiota","arrombado","fdp","filho da puta",

        "orospu","sikti","bok","aptal","salak",

        "blyat","suka","ebat","durak",

        "baka","kisama","aho","fuzakeru",

        "gaesaekki","ssibal","meongcheong","baegopa",

        "madarchod","bhosdike","chutiya","lund"
    ];

    // -------------------------------
    // DETECCIÓN ULTRA-EXTREMA
    // -------------------------------

    // 1. Insultos exactos
    if (insultos.includes(r) || insultos.includes(reversed)) {
        msg.delete().catch(() => {});
        return msg.channel.send(`⚠️ ${msg.author}, ese mensaje no está permitido.`)
            .catch(() => {});
    }

    // 2. Insultos dentro de frases
    for (const insulto of insultos) {
        if (r.includes(insulto) || reversed.includes(insulto)) {
            msg.delete().catch(() => {});
            return msg.channel.send(`⚠️ ${msg.author}, ese mensaje no está permitido.`)
                .catch(() => {});
        }
    }

    // 3. Insultos disfrazados
    const insultosRegex = [
        /p[uú]t[aá]/i,
        /pvt[a4]/i,
        /p[#@]t[a4]/i,
        /m[i1]erd[a4]/i,
        /g[i1]l[i1]p[o0]ll[a4]s/i,
        /c[a4]br[o0]n/i,
        /m[a4]r[i1]c[o0]n/i,
        /h[i1]j[o0]pvt[a4]/i,
        /b[i1]tch/i,
        /f[uú]ck/i,
        /f[*!¡]ck/i,
        /b[*!¡]tch/i,
        /s[uú]k[a4]/i,
        /b[l1]y[a4]t/i,
        /fdp/i,
        /put[a4]/i
    ];

    for (const regex of insultosRegex) {
        if (regex.test(original) || regex.test(r) || regex.test(reversed)) {
            msg.delete().catch(() => {});
            return msg.channel.send(`⚠️ ${msg.author}, ese mensaje no está permitido.`)
                .catch(() => {});
        }
    }
};
