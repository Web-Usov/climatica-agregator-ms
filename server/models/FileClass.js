const fs = require('fs')
class File {
    constructor(props = {}) {

    }

    static async bytesToFile(item) {
        const buff = Buffer.from(item.attachment.data, 'base64');
        if(!item.fileName) throw new Error("Error - FileClass.bytesToFile.fileName: File's name undefind ")
        await fs.writeFileSync(process.env.UPLOADS + '/' + item.fileName, buff)
    }

    static async fileToBytes(fileName){
        const buf = await fs.readFileSync(process.env.UPLOADS + '/' + fileName).toString('base64')
        return buf
    }
    static async delete(fileName) {
        await fs.unlinkSync(process.env.UPLOADS + '/' + fileName)
    }
}

module.exports = File;