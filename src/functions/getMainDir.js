const { app } = require('electron')
const settings = require(`${app.getPath('userData')}/misc/settings.json`)

exports.handler = async () => settings?.mainPath