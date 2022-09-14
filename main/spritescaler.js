// Select Folder for the path attribute (Input)
async function setInputDir() {
    const results = await window.electronAPI.setInputDir()
    if (!results) return;
    const inputDir = document.getElementById('inputDir')
    inputDir.innerHTML = results
    return true
}

async function scaleSprite() {
    document.getElementById('scaler').disabled = true
    console.log(document.getElementById('spriteSize').checked, document.getElementById('inputDir').innerHTML)
    window.electronAPI.scaleSprite(document.getElementById('spriteSize').checked, document.getElementById('inputDir').innerHTML)
    return;
}