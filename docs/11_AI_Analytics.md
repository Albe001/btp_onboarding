# Navigation

**Previous Steps**
[Deploy and Test App in SAP BTP](10_Deploy_and_Test_App_in_SAP_BTP.md).

[Table of Contents](Table_of_Contents.md).

[CAP Documentation](https://cap.cloud.sap/docs/).

**Next Steps**
[Gen AI to Diagram](12_Gen_AI_to_Diagram.md).

## Fiori Action

In this Guide we want to use AI to help us with the Analysis of our incidents. 
The goal here is to add a specific button in our incidents view that lets us insert a question regarding the incidents data. 
The AI then evaluates this question an the response is then represented as a pop-up.
Our goal can simply be achieved by utilizing `actions` from Fiori:

1. Navigate to `srv` and open the `processors-service.cds` file.

> **_NOTE:_** The [CAP documentation for actions](https://cap.cloud.sap/docs/java/application-services#trigger-action-or-function) might be helpful here.

   Add the "checkAI" action to the "ProcessorsService":

```
service ProcessorsService { 
  action checkAI (Query: String);
   . . .
}
```
This adds the action to the Service. The "Query: String" is the input Question from the user.

2. To get the visual button in our application, we need to add an Item in the `annotations.cds` file.
   For that, navigate to `app` &rarr; `incidents` from the root of the project and open the `annotations.cds` file.
   Add the new button:

```
annotate service.Incidents with @(
    UI.LineItem : [
        {
            $Type : 'UI.DataFieldForAction',
            Action : 'ProcessorsService.EntityContainer/checkAI',
            Label : '{i18n>Evaluate_AI}'
        },
        . . . 
    ]
);
```

> **_NOTE:_** Technically the button is now already existent in our view. By opening our incidents view (`cds watch` in the root of the project &rarr; localhost &rarr; `/launchpage.html` &rarr; Incident_Management) The `Evaluate_AI` button occurs next to the `Create` and `Delete` button. However, nothing happens when pressing it since the functionality still need to be implemented.

3. Add an event handler in the `processors-service.js` file. For that, go back in the `srv` folder and open the `processors-service.js` file.
  Add our checkAI action in hte init() like following:

```js
  init() {
    . . . 
    this.on("checkAI", (req) => this.onCheckAI(req));
    return super.init();
  }
```

Now the `onCheckAi(req)` functions remains to be implemented.

4. Now we implement the functionality of the button. For that, we create a new function below `changeUrgencyDueToSubject(data)`.
  The function needs to handle following three points:
    - Get the Incidents data and convert it into csv format.
    - Get the user input.
    - Form the input query and send the query to the AI endpoint.
  
> **_NOTE:_** Again, the CAP documentation might be helpful here regarding [queries](https://cap.cloud.sap/docs/node.js/cds-ql#select-from).

   At first we gather the Incidents data:

```js
class ProcessorsService extends cds.ApplicationService {
  . . .
  async onCheckAI(req) {
    let incidents = await SELECT`ID,title,urgency_code,status_code`.from (this.entities.Incidents);
    const headers = Object.keys(incidents[0]);
    let csv = headers.join(',') + '\n';

    incidents.forEach(obj => {
      const values = headers.map(header => obj[header]);
      csv += values.join(',') + '\n';
    })
  }
  . . . 
}
```
By using a `SELECT` statement, we get the Incidents data in JSON format. The remaining code converts it into csv format.

5. Now we get the user input by adding this:

```js
async onCheckAI(req) {
  . . .
  let userInput = req.data.Query;
}
```

6. Since we are working with sensitive data in the following tasks, we now create a `.env` file:

   - Navigate to the root of the project and type in following in the terminal:
      ```
      npm install dotenv
      ```
   - Create a new file in hte root of the project and name it `.env`. Write following in the file:

      ```
      USERNAME=
      PASSWORD=
      ```
   - Open the `.gitignore` file and add `.env` in the `# CAP incidents-mgmt` section.
  
   - Open the `processor-service.js` file and write following in the first line of the file:

      ```
      require('dotenv').config();
      ```

7. The next step is to form the query and send it to the AI endpoint. For that, we define two separate functions `getToken()` and `doQuery(bearerToken,userInput,csv)`:

```js
async function getToken() {
    
  const url = 'https://btplearning-w4kbx4of.authentication.us10.hana.ondemand.com/oauth/token?grant_type=client_credentials&response_type=token';
  const username = process.env.USERNAME;
  const password = process.env.PASSWORD;
  
  const headers = new Headers();
  headers.append('Authorization', 'Basic ' + btoa(username + ':' + password));
  
  return fetch(url, {
      method: 'POST',
      headers: headers
  })
  .then(response => response.json())
  .then(data => {
   return data.access_token;
  })
  .catch(error => console.error(error)); 
}

async function doQuery(token,query,inputCsv) {

  const url = "https://api.ai.prod.us-east-1.aws.ml.hana.ondemand.com/v2/inference/deployments/d85ed0c1b02d8a27/chat/completions?api-version=2023-05-15";
  const headers = {
      "Content-Type": "application/json",
      "AI-Resource-Group": "default",
      "Authorization": "Bearer " + token
  };
  
  const body = {
      "messages": [
          {
              "role": "user",
              "content": "Given following data in csv format:" + "\n \n" + inputCsv + "\n \n" + query
          }
      ],
"max_tokens": 1000,
"temperature": 0.0,
"frequency_penalty": 0,
"presence_penalty": 0,
"stop": "null"
};

const requestOptions = {
  method: "POST",
  headers: headers,
  body: JSON.stringify(body)
};

return fetch(url, requestOptions)
.then(response => response.json())
.then(data => {
  return data
})
.catch(error => console.log(error));
}
```

The `getToken()` function yielda the `BearerToken`, a necessary authentication token for the AI query. With that, `doQuery(bearerToken,userInput,csv)` perform the query.

8. With the help of the two functions above, we can finalize our button by adding this to our `onCheckAI(req)` function:

```js
  async onCheckAI(req) {
    . . .
    let bearerToken = await getToken();
    let response = await doQuery(bearerToken,userInput,csv);
    
    req.info(response.choices[0].message.content);

    console.log("Question: \n" + userInput);
    console.log("Answer: \n" + response.choices[0].message.content);
  }
```

With that, our `Evaluate_AI` button is ready to be used. Feel free to play around and execute some interesting queries about the incidents!

## Next Steps

You have implented a button that can be used to ask an AI service for analysis of data.

**Previous Steps**
[Deplay and Test App in SAP BTP](10_Deplay_and_Test_App_in_SAP_BTP.md).

[Table of Contents](Table_of_Contents.md).

**Next Steps**
[GEN AI to Diagram](12_Gen_AI_to_Diagram.md).
