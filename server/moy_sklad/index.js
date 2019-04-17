require('isomorphic-fetch')
const ms = require('moysklad')
const fs = require('fs')

// Инициализировать экземпляр библиотеки можно без ключевого слова new
const ms_client = ms({ login:process.env.MS_USER, password:process.env.MS_PASSWORD })
const entityId = JSON.parse( fs.readFileSync(__dirname+'/entity-id.json'))

module.exports = {
    ms,
    ms_client,
    entityId
}