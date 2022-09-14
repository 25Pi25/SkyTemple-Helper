const { dialog, mainWindow } = require('electron');
const { writeFileSync } = require('fs');
const path = require('path');
const settings = require('../../assets/settings.json');

exports.handler = async () => {
    const { canceled, filePaths } = await dialog.showOpenDialog(mainWindow, {
        properties: ['openDirectory']
    })
    if (!canceled) {
        settings.mainPath = filePaths[0]
        writeFileSync(path.resolve(__dirname, '../../assets/settings.json'), JSON.stringify(settings))
    }
    return canceled ? undefined : filePaths[0]
}