const express = require("express");
const cors = require("cors");
const app = express();
const axios = require('axios');
const bodyParser = require("body-parser");
const port = process.env.PORT || 5500;



const SendBird = require('sendbird');
var sb = new SendBird({appId: APP_ID});

const dialogflow = require('@google-cloud/dialogflow').v2beta1;


app.use(cors());
app.use(express.json());

//sendbird info
var APP_ID = 'AD791A35-62CA-4E37-A490-79C7368C5D77';
var BOT_ID = 'bot1';
const TOKEN = 'eb55f1c4e4118a422644b97f0e62ba1f39014649';
const ENTRYPOINT = 'https://api-AD791A35-62CA-4E37-A490-79C7368C5D77.sendbird.com/v3/bots';

//dialogflow configuration
var DIALOGFLOW_PROJECT_ID = 'ocbc-personal-banker-n9li';
var GOOGLE_SESSION_ID = 'd-FL95Q19q7MQmFpd7hHD0Ty';
var DIALOGFLOW_LANG = 'en-US';









app.get("/message", (req, res) => {
  res.json({ message: "Hello from server!" });
});

app.listen(port, () => {
  console.log(`Server is running on ${port}`);
});

app.post("/new_ticket_webhook", async (req, res) => {
    // Send 200 OK response
   res.status(200).send("OK"); // Respond right away to avoid duplicate webhooks
   const data = req.body.data; // Extract data from request body
   const eventType = req.body.eventType; // Extract event type from request body
   // Check if the event type is 'TICKET.CREATED'
   if (eventType === 'TICKET.CREATED') {
       const channelUrl = data.channelUrl; // Extract channel URL from data
       const botId = "1"; // Specify bot ID
         // Invite bot to the channel
        const sendInvite = await inviteBotToChannel(channelUrl, botId);
 }
 });


 async function inviteBotToChannel(channelUrl, botId) {
    const endpoint = `https://api-${APP_ID}.sendbird.com/v3/group_channels/${channelUrl}/invite`;
    const headers = {
      'Content-Type': 'application/json',
      'Api-Token': API_TOKEN 
    };
    const data = {user_ids: [botId]};
    try {
      // Send a POST request to invite the bot
      const response = await axios.post(endpoint, data, { headers: headers });
      return response.data;
    } catch (error) {
      // Throw an error if the invitation fails
      throw new Error(`Failed to invite bot. Status: ${error.response.status}. Response:   
      ${error.response.data}`);
    }
  }

  app.post("/hand_off", async(req, res) => {
    const channelUrl = req.body.channel_url;
    try {
        const updateResponse = await updateTicketStatus(channelUrl);
        if (updateResponse.success) {
            res.status(200).send({ "message": "Handing over to a human. Just a minute please." });
        } else {
            throw new Error(updateResponse.message);
        }
    } catch (e) {
        res.status(400).send({ "error": true, "message": e.message || "Failed to perform hand over" });
    }
});


async function updateTicketStatus (channelUrl) {
    try {
      const ticket = await axios.get(`https://desk-api-${APP_ID}.sendbird.com/platform/v1/tickets?channel_url=${channelUrl}`, {
         headers: { 
           "Content-Type": "application/json; charset=utf8",
           "SENDBIRDDESKAPITOKEN": SENDBIRDDESKAPITOKEN
         }
      })
      const ticketId = ticket.data.results[0].id
      const ticketUpdate = await axios.patch(`https://desk-api-${APP_ID}.sendbird.com/platform/v1/tickets/${ticketId}`,{
        "priority": "HIGH"}, {
         headers: { 
           "Content-Type": "application/json; charset=utf8",
           "SENDBIRDDESKAPITOKEN": SENDBIRDDESKAPITOKEN
         }
      })
      const assignGroup = await axios.post(`https://desk-api-${APP_ID}.sendbird.com/platform/v1/tickets/transfer_to_group`,{
        "tickets": [ticketId],
        "status": "PENDING",
        "groupKey":"example1"
      }, {
         headers: { 
           "Content-Type": "application/json; charset=utf8",
           "SENDBIRDDESKAPITOKEN": SENDBIRDDESKAPITOKEN
         }
      })
      return { success: true, message: 'Ticket updated successfully' };
    } catch (e) {
      console.log(e)
      return { success: false, message: 'Failed to update ticket' };
    }
  }




  app.post('/callback', express.json(), async (req, res) => {
    const { message, bot, channel } = req.body;
    // let obj = JSON.parse(req.body);
    console.log("message", message + " bot " + bot + " channel " + channel)
    console.log('Request ody', req.body);
    // console.log('1', req.body.bot.bot_userid);

    if (message && bot && channel) {
        /**
         * Get bot id and channel url
         */
        const botId = bot.bot_userid;
        const channelUrl = channel.channel_url;
        /**
         * Get input text and send to dialogflow
         */
        const msgText = message.text;
        console.log('Sending to DialogFlow...');
        /**
         * Send user message from Sendbird to dialogflow
         */
        let botrespond = await sendToDialogFlow(msgText, async (response) => {
            console.log('Response from DF: ' + response);
            /**
             * Lastly, send Dialogflow response to chat using our Bot
             */
            await fromDialogFlowSendMessageToChannel(response, channelUrl, botId);
            /**
             * Respond HTTP OK (200)
             */
            res.status(200).json({
                message: 'Response from DialogFlow: ' + response
            });        
        });
        //return botrespond;
    } else {
        
        res.status(200).json({
            
            message: 'Wrong format'
           
        });
    }
});


async function fromDialogFlowSendMessageToChannel(queryText, channelUrl, botId) {
    const params = {
        message: queryText,
        channel_url: channelUrl
    }
    await axios.post(ENTRYPOINT + '/' + botId + '/send', params, {
        headers: { 
            "Api-Token": TOKEN,
            'Content-Type': 'application/json'
        },
    });
}

function sendToDialogFlow(message, callback) {
// function sendToDialogFlow(message) {
    try {
        const queries = [
            message
        ];
        const response = executeQueries(DIALOGFLOW_PROJECT_ID, GOOGLE_SESSION_ID, queries, DIALOGFLOW_LANG, callback);    
        return response;
    } catch (error) {
        console.log(`${error}`)
    }
}

async function executeQueries(projectId, sessionId, queries, languageCode, callback) {
    let context;
    let intentResponse;
    for (const query of queries) {
        try {
            intentResponse = await detectIntent(
                projectId,
                sessionId,
                query,
                context,
                languageCode
            );
            console.log(intentResponse.queryResult);
            const responseText = intentResponse.queryResult.fulfillmentText;
            context = intentResponse.queryResult.outputContexts;
            callback(responseText);
        } catch (error) {
            console.log(error);
            callback('Error from DialogFlow: ' + error);
        }
    }
}

async function detectIntent(projectId, sessionId, query, contexts, languageCode) {
    const sessionClient = new dialogflow.SessionsClient();
    const sessionPath = sessionClient.projectAgentSessionPath(
        projectId,
        sessionId
    );
    const request = {
        session: sessionPath,
        queryInput: {
        text: {
            text: query,
            languageCode: languageCode,
        },
        },
    };
    if (contexts && contexts.length > 0) {
        request.queryParams = {
        contexts: contexts,
        };
    }
    const responses = await sessionClient.detectIntent(request);
    return responses[0];
}
