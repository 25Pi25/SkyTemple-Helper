const axios = require("axios");
const pokemonArray = require('../../assets/pokemon.json');

exports.handler = async (event, pokemon) => {
    pokemon = pokemonArray.indexOf(pokemon)
    const { data } = await axios.request("https://spriteserver.pmdcollab.org/graphql", {
        method: 'post',
        headers: { 'Content-Type': 'application/json' },
        data: {
            query: `query ($pokemon: Int!) { monster(filter:[$pokemon]) { id name forms { fullName portraits{ sheetUrl previewEmotion { url }} sprites{ zipUrl animDataXml }}}}`,
            variables: { pokemon }
        }
    })

    return data.data.monster[0]
}