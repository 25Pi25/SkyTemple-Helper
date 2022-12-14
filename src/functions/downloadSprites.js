const axios = require("axios");
const admZip = require('adm-zip');
const { writeFileSync, mkdirSync, existsSync } = require("fs");
const { app } = require("electron");
const settings = require(`${app.getPath('userData')}/misc/settings.json`)

exports.handler = async (event, variant, pokemon) => {
    try {
        const { data } = await axios.get(variant.sprites.zipUrl, { responseType: 'arraybuffer' })
        const zip = new admZip(data).getEntries();

        const output = `${settings.mainPath}/${pokemon}-${variant.fullName}-sprite`
        if (!existsSync(output)) mkdirSync(output)
        for (const entry of zip) writeFileSync(`${settings.mainPath}/${pokemon}-${variant.fullName}-sprite/${entry.entryName}`, entry.getData())

        mainWindow.webContents.send('alert', true)
    } catch (err){mainWindow.webContents.send('alert', false)}
    mainWindow.webContents.send('enableButton', 'downloadSprites')
}