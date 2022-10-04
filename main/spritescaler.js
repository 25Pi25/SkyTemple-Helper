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
    console.log(parseInt(document.getElementById('spriteSize').value), document.getElementById('inputDir').innerHTML)
    console.log(document.getElementById('spriteSize').value)
    window.electronAPI.scaleSprite(Number(document.getElementById('spriteSize').value), document.getElementById('inputDir').innerHTML)
    return;
}