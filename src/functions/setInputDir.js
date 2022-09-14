const { dialog, mainWindow } = require('electron');

exports.handler = async () => {
    const { canceled, filePaths } = await dialog.showOpenDialog(mainWindow, {
        properties: ['openDirectory']
    })
    return canceled ? undefined : filePaths[0]
}