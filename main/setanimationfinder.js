let animIndexes = []

// Dynamic dropdown
async function updateTertiaryOption() {
    const xmlJSON = await window.electronAPI.readXMLData(selectedVariant)
    animIndexes = []
    if (!xmlJSON) {
        document.getElementById('animationList').innerHTML = ''
        return;
    };
    let animList = []
    xmlJSON.AnimData.Anims[0].Anim.forEach(x => {
        animIndexes.push([x.Index?.[0] ? parseInt(x.Index?.[0]) : -1, x.Name[0]])
        animList.push(x.Name[0])
    })
    animList = animList.map(x => `<option value=${x}>${x}</option>`)
    document.getElementById('animationList').innerHTML = animList.join("\n")
    updateTable()
}

// Initialize Table
document.getElementById('animationList').addEventListener('input', updateTable)

async function updateTable() {
    const anim = document.getElementById('animationList').value
    const filteredRef = await window.electronAPI.filterRef(animIndexes.find(x => x[1] == anim)[0])
    const finalMap = filteredRef.map(x => {
        let builder = `<tr>`
        builder += `<td>${x.setAnimation}</td>`
        const bools = ['freezes', 'loops', 'overrideSpeed']
        bools.forEach(bool => {
            builder += `<td>${x[bool] ? '✔️' : '❌'}</td>`
        })
        const speeds = ['slowID', 'mediumID', 'fastID', 'freezeID']
        speeds.forEach(speed => {
            builder += `<td>${x[speed] || ''}</td>`
        })
        const unks = ['unk1', 'unk2']
        unks.forEach(unk => {
            builder += `<td>${x[unk] ? '✔️' : '❌'}</td>`
        })

        return builder;
    })
    finalMap.unshift('<tr><th>ID</th><th>Freezes?</th><th>Loops?</th><th>Change Speed?</th><th>Slow ID</th><th>Medium ID</th><th>Fast ID</th><th>Freeze ID</th><th>Unk1</th><th>Unk2</th></tr>')
    document.getElementById('setAnimationTable').innerHTML = finalMap.join("")
}