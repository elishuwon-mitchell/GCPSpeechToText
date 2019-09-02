This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

# Speech To Text using Google Cloud Platform Products


## About:
The goal of this project was to gain exposure to using various different Google Cloud Platform
products. This was done by creating an app that converts speech to text. It was originally done on a raspberry pi, hence the name of the repo.

## Prerequisites
1. node - [install it here](https://nodejs.org/en/)
2. a Google Cloud Platform account setup with a service account
    * You can create a [free account](https://cloud.google.com/free/)
    * Learn about and create a [service account](https://cloud.google.com/iam/docs/creating-managing-service-accounts)
3. SoX (command line tool for audio) - [install it here](http://sox.sourceforge.net/)
4. gcloud -[install it here](https://cloud.google.com/sdk/docs/downloads-interactive)

## Design
Note: The design of the project is purposefully overcomplicated for the function of the application. Again, the goal of the project was to gain exposure to using various products on Google Cloud Platform not simply to create an app that translates speech to text and display that text on screen.

Architecture diagram of the application:
![](https://github.com/elishuwon-mitchell/RaspberryPiSpeechToText/blob/master/app_architecture.png)

## Setup
1. Download the private key for your service account as JSON and save it in a file called `application_credentials.json` in the root of this project directory
2. Set the environment variable `GOOGLE_APPLICATION_CREDENTIALS` to the file path of the `application_credentials.json` file that you just created
    * On a Mac you can use the command: ```export GOOGLE_APPLICATION_CREDENTIALS=path/to/applications_credentials.json/file```
3. Enable the necessary APIs for your project:
    * On the GCP console open the side menu on click on `API and Services`
    * Click on `+ Enable API and Services` to the top
    * Search for and enable the Cloud Speech API, Cloud Functions API, Cloud Storage API, and the Cloud Pub/Sub API
4. Cloud Storage:
    * Create a bucket in cloud storage. Take the name of the bucket you created and put it in place of the example bucket name on line 53 in the server.js file and on line 16 in the cloud_functions/convert_speech_to_text/index.js file ```const bucketName = 'your-bucket-name';```
5. Cloud Pub/Sub:
    * Create a topic in Pub/Sub. Take the name of the topic you created and put it in place of the example topic name on line 9 in the cloud_functions/convert_speech_to_text/index.js file here ```const topicName = 'your-topic-name';```. Next go back to Pub/Sub and create a subscription for that topic. Take that subscription name and put it in place of the example subscription name on line 18 in the server.js file here ```const subscriptionName = 'your-subscription-name';``` 


## Run:
Install node modules
```
npm i
```

Login to authenticate your Google Cloud Account 
```
npm login
```

Change directory into the `cloud_functions/convert_speech_to_text/` directory and deploy your cloud function. Be sure to replace `YOUR-BUCKET-NAME` with the actual name of your Cloud Storage bucket :-).
```
cd cloud_functions/convert_speech_to_text/
gcloud functions deploy convertSpeech --runtime nodejs8 --trigger-resource eli-mitchell --trigger-event google.storage.object.finalize
```

Change directory back to the root of the project and start the app:
```
cd ../..
npm start
```

Open you browser and navigate to `http://localhost:3000`
