const express = require('express');
const path = require('path');
const { exec } = require('child_process');
const { Storage } = require('@google-cloud/storage');
const { PubSub } = require(`@google-cloud/pubsub`);
const http = require("http");
const socketIo = require("socket.io");

const app = express()
const server = http.createServer(app);
const io = socketIo(server);

const { appConfig } = require('./config');

// Cloud Storage initialization
const storage = new Storage();
const { bucketName, fileName } = appConfig.cloudStorage;

// Cloud PubSub initialization
const pubsub = new PubSub();
const subscriptionName = appConfig.pubsub.subscriptionName;
const timeout = 60 * 10;
const subscription = pubsub.subscription(subscriptionName);

app.set('port', process.env.PORT || 3000);
app.use('/', express.static(path.join(__dirname, '/build/')));

app.get('/', function (req, res) {
	res.sendFile(__dirname + "/index.html");
});

/**
 * Executes shell command to record audo via the machines microphone
 * 
 * @returns { Promise } 
 */
function runSpeechRecording() {
	const command = "rec -r 16000 -b 16 -c 1 -e signed-integer speech.raw trim 0 5";
	//const command = "sleep 5"; //test command to ensure blocking before hitting speech API
	return new Promise((resolve, reject) => {
		exec(command, (err, stdout, stderr) => {
			if(err) {
				console.log(`Error executing speech command: ${err}`);
				reject(err);
			}
			console.log(`Stdout: ${stdout}`);
			resolve(true);
		});
	});
}

app.post('/run', async (req, res) => {

	try {
		// Record speech
		await runSpeechRecording();
	} catch (err) {
		return res.status(500).send();
	}

	const filePath = `./${fileName}`;
	try {
		// Make call to cloud storage api to save speech file
		await storage.bucket(bucketName).upload(filePath);
		console.log(`File ${filePath} uploaded to storage bucket ${bucketName}.`);
		return res.send(true);
	} catch (error) {
		console.error(error);
		return res.status(500).send(error);
	}

});

const getMessages = async socket => {
	subscription.on(`message`, message => {
		console.log("Message recieved from PubSub topic.");
		const dataString = message.data.toString();
		const dataObj = JSON.parse(dataString);
		console.log("Translated speech is:" , dataObj.text);
		socket.emit("messageRecieved", dataObj.text);
		message.ack();
	});
	setTimeout(() => {
		//TODO: clean up message handler on connection close, something like below
		// subscription.removeListener('message', messageHandler);
		console.log(`Closing connection.`);
	}, timeout * 1000);
};

io.on("connection", socket => {
	console.log("New client connected");
	getMessages(socket);
	socket.on("disconnect", () => console.log("Client disconnected"));
});

server.listen(app.get('port'), function () {
  console.log('Speech to text app listening on port', app.get('port'));
});
