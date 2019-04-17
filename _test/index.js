const { toCorrectReq } = require('../server/utils')


const req = {
    list: ['Bob', 'Jon', 'Ivan'],
    group:6215
}

try {
    console.log(toCorrectReq(
        req,
        ["name", "list"],
        ['group']
    ));

} catch (error) {
    console.error("Ошибка toCorrectReq - " , error)
}