const axios = require("axios");
const { ipcRenderer } = require("electron");
const { writeFileSync } = require("fs");
const settings = require('../../assets/settings.json');

exports.handler = async (event, variant, pokemon) => {
    try {
        if (!settings.mainPath) { await ipcRenderer.invoke('setMainDir'); return }
        const { data } = await axios.get(variant.portraits.sheetUrl, { responseType: 'arraybuffer' })
        writeFileSync(`${settings.mainPath}/${pokemon}-${variant.fullName}-portrait.png`, data)
        mainWindow.webContents.send('alert', true)
    } catch (err) { mainWindow.webContents.send('alert', false) }
    mainWindow.webContents.send('enableButton', 'downloadPortraits')
}