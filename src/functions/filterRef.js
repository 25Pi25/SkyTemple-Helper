const animRef = require('../../assets/animreference.json')

exports.handler = (event, index) => animRef.filter(x => x.index === index)