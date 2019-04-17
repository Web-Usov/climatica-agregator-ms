module.exports = (query = {},reqParams = [], optionalParams = []) => {
    const correctReq = {}
    reqParams.forEach( param => {
        if(query[param] === null || query[param] === undefined) throw new Error(`Cannot find required field '${param}' in query`)
        correctReq[param] = query[param]
    })
    optionalParams.forEach(param => {
        if(query[param] !== null && query[param] !== undefined) correctReq[param] = query[param]
    })
    return correctReq;
}