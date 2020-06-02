Google Passport Example
========================

This app is a building block for using Google's OAuth 2.0 login protocol, with the Node Passport module.

## Getting set up and running

You will need to create a project on Google Cloud Services, and enable this project to 
do OAuth 2.0 login.  As part of this process you will:

Give Google the URLs of this app, and of an intermediate route which it will use in the login process

Get a client ID and secret (these are like the API keys), and add them in the `.env` file. 

See the [detailed instructions](https://web.cs.ucdavis.edu/~amenta/s20/oauthClientID.html)

Files in the user/ directory are protected and available only to users who are logged in. 

Files in /public are available to the whole world, as usual. 


Authorship
--------------

Based on Jared Hanson's [passport-google-oauth20](https://github.com/jaredhanson/passport-google-oauth2) 
exmaple.

Original Glitch App Made by Fog Creek [mission-control-login](https://glitch.com/~mission-control-login)


Remixed and modified by Nina Amenta for ECS 162


