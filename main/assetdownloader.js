async function updateTertiaryOption() {
    console.log(selectedVariant)
    document.getElementById('portraitPreview').innerHTML = `<img src="${selectedVariant.portraits.sheetUrl}">`
    document.getElementById("downloadPortraits").disabled = disabledButtons.portrait || !selectedVariant.portraits.previewEmotion
    document.getElementById("downloadSprites").disabled = disabledButtons.sprite || !selectedVariant.sprites.animDataXml
}