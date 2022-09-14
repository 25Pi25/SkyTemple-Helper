const { readFileSync } = require('fs');
const path = require('path');
const axios = require('axios');
const { parseStringPromise } = require('xml2js');


exports.handler = async (event, variant) => {
    try {
        let xml = await axios.get(variant.sprites.animDataXml)
        xml = await parseStringPromise(xml.data)
        return xml;
    } catch {
        return undefined
    }
}