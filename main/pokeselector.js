let pokemonData = {}
let selectedVariant;
let pokemon = 'Missingno_'
const disabledButtons = { portrait: false, sprite: false }

// Auto-update pokemon selection
document.getElementById('pokemonInput').addEventListener('input', () => {
    setTimeout(waitForNoInput, 500, document.getElementById('pokemonInput').value);
    async function waitForNoInput(item) {
        if (item !== document.getElementById('pokemonInput').value) return;
        const newPokemon = item === '' ? 'Missingno_' : await window.electronAPI.getClosestPokemonMatch(item)
        if (newPokemon !== pokemon) {
            document.getElementById('pokemonInputPredict').innerHTML = ` - ${newPokemon}`
            pokemonData = await window.electronAPI.getPokemonData(newPokemon)
            updateVariants()
        }
        pokemon = newPokemon
    }
})

document.getElementById('variantList').addEventListener('input', updateSelectedVariant)

function updateVariants() {
    document.getElementById('variantList').innerHTML = pokemonData.forms.map(x => `<option value="${x.fullName}">${x.fullName}</option>`)
    updateSelectedVariant();
}

function updateSelectedVariant() {
    selectedVariant = pokemonData.forms.find(x => x.fullName == document.getElementById('variantList').value)
    updateTertiaryOption();
}