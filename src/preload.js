// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts

const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
	setMainDir: () => ipcRenderer.invoke('setMainDir'),
	getMainDir: () => ipcRenderer.invoke('getMainDir'),
	getClosestPokemonMatch: item => ipcRenderer.invoke('getClosestPokemonMatch', item),
	readXMLData: variant => ipcRenderer.invoke('readXMLData', variant),
	filterRef: index => ipcRenderer.invoke('filterRef', index),
	getPokemonData: pokemon => ipcRenderer.invoke('getPokemonData', pokemon),
	downloadPortraits: (variant, pokemon) => ipcRenderer.invoke('downloadPortraits', variant, pokemon),
	downloadSprites: (variant, pokemon) => ipcRenderer.invoke('downloadSprites', variant, pokemon),
	setInputDir: () => ipcRenderer.invoke('setInputDir'),
	scaleSprite: (size, input) => ipcRenderer.invoke('scaleSprite', size, input),
	notify: success => ipcRenderer.send('')
})

contextBridge.exposeInMainWorld("electron", {
    listenTo: (channel, callback) => {
        const subscription = (_event, ...args) => callback(...args);
        ipcRenderer.on(channel, subscription);

        return () => {
            ipcRenderer.removeListener(channel, subscription);
        };
    }
});