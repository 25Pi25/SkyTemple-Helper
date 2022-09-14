const { ipcMain } = require('electron');
const { readdirSync } = require('fs');
const path = require('path');

exports.handleIPC = () => {
    const functions = readdirSync(path.resolve(__dirname, './functions')).map(x => x.replace(".js", ""))
    functions.forEach(operation => {
        const { handler } = require(`./functions/${operation}.js`)
        ipcMain.handle(operation, handler)
    })
}