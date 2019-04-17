const { getGmail } = require('../google_api/helper')
const fs = require('fs')
const File = require('./FileClass')
const { toUtf8 } = require('../utils')

const MailComposer = require('nodemailer/lib/mail-composer');

class Message {

    static async getList(userData, props) {

        const gmail = getGmail(userData)
        const list = await gmail.users.messages.list({
            userId: 'me' || props.userId,
            q:props.q || process.env.AGREGATOR_SEARCH,
            ...props
        })
        return list.data
    }

    static async get(userData, props, cb) {
        const gmail = getGmail(userData)
        const message = await gmail.users.messages.get({
            userId: props.userId || 'me',
            ...props
        })
        return message.data
    }

    static async getAttachments(userData, params) {
        const { message, userId } = params;
        const list = message.payload.parts
        const attachments = []
        for (let i = 0; i < list.length; i++) {
            const item = list[i]
            if (item.filename && item.filename.length > 0) {
                const attachId = item.body.attachmentId;

                const attachment = await this.getAttachment(userData, { attachId, messageId: message.id, userId })
                attachments.push({
                    fileName: item.filename,
                    mimeType: item.mimeType,
                    attachment
                })

            }

        }
        return attachments
    }

    static async getAttachment(userData, props) {
        const { attachId, messageId, userId } = props
        const gmail = getGmail(userData)

        const attachment = await gmail.users.messages.attachments.get({
            id: attachId,
            messageId,
            userId: userId || 'me'
        });

        return attachment.data
    }

    static async sendMessage(userData, props = {}, cb) {
        const gmail = getGmail(userData)
        // You can use UTF-8 encoding for the subject using the method below.
        // You can also just use a plain string if you don't need anything fancy.

        let attachment = null
        if (props.fileName) attachment = {
            filename: props.fileName,
            encoding: 'base64',
            content: await File.fileToBytes(props.fileName)
        }
        
        let mail = new MailComposer(
            {
                from :`"ClimaticaRus.Robot" <${props.from || process.env.GMAIL_FROM_EMAIL}>`,
                to: `"AgregatorMS" <${props.to || process.env.GMAIL_TO_EMAIL}>`,
                text: props.body ? props.body.join(' ') : "",
                html: props.body ? props.body.join('<br/>') : "",
                subject: props.subject || 'Письмо от робота ClimaticaRus!',
                textEncoding: "base64",
                attachments: attachment
            });

        await mail.compile().build(async (err, msg) => {
            if (err) throw new Error("E:MessagesClass.sendMessage.mail.compile", err)

            const encodedMessage = Buffer.from(msg)
                .toString('base64')
                .replace(/\+/g, '-')
                .replace(/\//g, '_')
                .replace(/=+$/, '');

            const res = await gmail.users.messages.send({
                userId: props.userId || 'me',
                requestBody: {
                    raw: encodedMessage,
                },
            });
            cb(res.data)
        })
    }
}

module.exports = Message;