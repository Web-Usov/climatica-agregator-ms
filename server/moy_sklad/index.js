require('isomorphic-fetch')
const ms = require('moysklad')

// Инициализировать экземпляр библиотеки можно без ключевого слова new
const ms_client = ms({ login:process.env.MS_USER, password:process.env.MS_PASSWORD })

module.exports = {
    ms,
    ms_client
}