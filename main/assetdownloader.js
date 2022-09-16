async function updateTertiaryOption() {
    console.log(selectedVariant)
    document.getElementById('portraitPreview').innerHTML = `<img src="${selectedVariant.portraits.previewEmotion ? selectedVariant.portraits.sheetUrl : ''}" alt="No Portraits." style="height: 410px; width: auto;">`
    document.getElementById('spritePreview').innerHTML = `<img src="${selectedVariant.sprites.recolorSheetUrl}" alt="No Sprites." style="height: 312px; width: auto;">`
    document.getElementById("downloadPortraits").disabled = disabledButtons.portrait || !selectedVariant.portraits.previewEmotion
    document.getElementById("downloadSprites").disabled = disabledButtons.sprite || !selectedVariant.sprites.animDataXml
}