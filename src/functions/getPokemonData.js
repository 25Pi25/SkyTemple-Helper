const axios = require("axios");
const pokemonArray = require('../../assets/pokemon.json');

exports.handler = async (event, pokemon) => {
    const { data } = await axios.request("https://spriteserver.pmdcollab.org/graphql", {
        method: 'post',
        headers: { 'Content-Type': 'application/json' },
        data: {
            query: `query ($pokemon: String!) { searchMonster(monsterName: $pokemon) { id name forms { fullName portraits{ sheetUrl previewEmotion { url }} sprites{ zipUrl animDataXml recolorSheetUrl }}}}`,
            variables: { pokemon }
        }
    })

    return data.data.searchMonster[0]
}