// Initialize Directory Output
window.electronAPI.getMainDir()
    .then(data => document.getElementById('dirPrompt').innerHTML = data ? `Output: ${data}` : "Select an Output Directory:")

// Select Folder for the path attribute
async function selectDir() {
    const results = await window.electronAPI.setMainDir()
    if (!results) return;
    const dirPrompt = document.getElementById('dirPrompt')
    dirPrompt.innerHTML = 'Output: ' + results
    return true
}

window.electron.listenTo("enableButton", id => document.getElementById(id).disabled = false)

window.electron.listenTo("alert", success => {
    success ? new Audio('../assets/downloaded.mp3').play() : new Audio('../assets/fail.mp3').play()
    document.getElementById('scaler').disabled = false
})