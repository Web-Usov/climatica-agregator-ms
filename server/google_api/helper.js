const { google } = require('googleapis')
exports.getGmail = (auth) => (google.gmail({ version: 'v1', auth }))