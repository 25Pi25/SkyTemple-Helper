const { closestMatch } = require("closest-match");
const pokemonArray = require('../../assets/pokemon.json');

exports.handler = (event, item) => {
    const pokemonList = pokemonArray
    const result = closestMatch(item, pokemonList)
    return result;
}