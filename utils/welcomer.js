const fs = require("fs");

module.exports = {
    obtenerCanal() {
        if (!fs.existsSync("./welcomer.json")) {
            fs.writeFileSync("./welcomer.json", JSON.stringify({ canal: null }, null, 4));
        }

        const data = JSON.parse(fs.readFileSync("./welcomer.json"));
        return data.canal;
    },

    establecerCanal(id) {
        const data = { canal: id };
        fs.writeFileSync("./welcomer.json", JSON.stringify(data, null, 4));
    }
};