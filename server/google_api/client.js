const fs = require('fs');
const readline = require('readline');
const { google } = require('googleapis');

const SCOPES = [
	'https://mail.google.com/',
	'https://www.googleapis.com/auth/gmail.modify',
	'https://www.googleapis.com/auth/gmail.compose',
	'https://www.googleapis.com/auth/gmail.send',
  ];

const TOKEN_PATH = __dirname + '/token.json';
const CREDENTIALS_PATH = __dirname + '/credentials.json';



const auth = ({ code, authUrl }, cb) => {


	fs.readFile(CREDENTIALS_PATH, (err, content) => {
		if (err) throw new Error('Ошибка загрузки client secret file:');

		const credentials = JSON.parse(content);
		const { client_id, client_secret, redirect_uris } = credentials.installed;

		const oAuth2Client = new google.auth.OAuth2(
			client_id,
			client_secret,
			redirect_uris[0]
		);




		fs.readFile(TOKEN_PATH, (err, token) => {
			if (err) {


				if (code && authUrl) {
					oAuth2Client.getToken(code, (err, token) => {
						if (err) throw new Error('Error retrieving access token', err)
						oAuth2Client.setCredentials(token);

						fs.writeFile(TOKEN_PATH, JSON.stringify(token), (err) => {
							if (err) throw new Error(err)
							console.log('Token stored to', TOKEN_PATH);
						});
						cb(null, oAuth2Client);
					});
				} else {

					const authorizeUrl = oAuth2Client.generateAuthUrl({
						access_type: 'offline',
						scope: SCOPES,
					});
					cb({
						message: 'Authorize this app by visiting url:',
						url: authorizeUrl
					})
				}


			} else {

				oAuth2Client.setCredentials(JSON.parse(token));
				cb(null, oAuth2Client);
			}
		})
	});
}





module.exports = {
	auth,
}