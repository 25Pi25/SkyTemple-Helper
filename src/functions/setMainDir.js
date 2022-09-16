const { dialog, mainWindow } = require('electron');
const { app } = require('electron');
const { writeFileSync } = require('fs');
const settings = require(`${app.getPath('userData')}/misc/settings.json`)

exports.handler = async () => {
    const { canceled, filePaths } = await dialog.showOpenDialog(mainWindow, {
        properties: ['openDirectory']
    })
    if (!canceled) {
        settings.mainPath = filePaths[0]
        writeFileSync(`${app.getPath('userData')}/misc/settings.json`, JSON.stringify(settings))
    }
    return canceled ? undefined : filePaths[0]
}