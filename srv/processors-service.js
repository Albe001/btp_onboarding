const cds = require('@sap/cds')
require('dotenv').config();

class ProcessorsService extends cds.ApplicationService {
  /** Registering custom event handlers */
  init() {
    this.before("UPDATE", "Incidents", (req) => this.onUpdate(req));
    this.before("CREATE", "Incidents", (req) => this.changeUrgencyDueToSubject(req.data));
    this.on("checkAI", (req) => this.onCheckAI(req));
    this.on("diagram", (req) => this.onDiagram(req));
    return super.init();
  }

  changeUrgencyDueToSubject(data) {
    if (data) {
      const incidents = Array.isArray(data) ? data : [data];
      incidents.forEach((incident) => {
        if (incident.title?.toLowerCase().includes("urgent")) {
          incident.urgency = { code: "H", descr: "high" };
        }
      });
    }
  }

  async onCheckAI(req) {
    let incidents = await SELECT`ID,title,urgency_code,status_code`.from(this.entities.Incidents);
    const headers = Object.keys(incidents[0]);
    let csv = headers.join(',') + '\n';

    incidents.forEach(obj => {
      const values = headers.map(header => obj[header]);
      csv += values.join(',') + '\n';
    });

    let userInput = req.data.Query;
    let bearerToken = await getToken();
    let response = await doQuery(bearerToken, userInput, csv);

    req.info(response.choices[0].message.content);

    console.log("Question: \n" + userInput);
    console.log("Answer: \n" + response.choices[0].message.content);

  }

  async onDiagram(req) {
    let incidents = await SELECT`ID,title,urgency_code,status_code`.from(this.entities.Incidents);
    let formattedIncidents = JSON.stringify(incidents);
    console.log(formattedIncidents);
    let userInput = req.data.Query;
    let bearerToken = await getToken();
    let response = await doDiagramQuery(bearerToken, userInput, formattedIncidents);

    return response.choices[0].message.content;

    //req.info(response.choices[0].message.content);

    console.log("Question: \n" + userInput);
  }

  /** Custom Validation */
  async onUpdate(req) {
    const { status_code } = await SELECT.one(req.subject, i => i.status_code).where({ ID: req.data.ID })
    if (status_code === 'C')
      return req.reject(`Can't modify a closed incident`)
  }
}

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

async function doQuery(token, query, input) {

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
        "content": "Given following data in csv format:" + "\n \n" + input + "\n \n" + query
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

async function doDiagramQuery(token, query, input) {

  const url = "https://api.ai.prod.us-east-1.aws.ml.hana.ondemand.com/v2/inference/deployments/d85ed0c1b02d8a27/chat/completions?api-version=2023-05-15";
  const headers = {
    "Content-Type": "application/json",
    "AI-Resource-Group": "default",
    "Authorization": "Bearer " + token
  };

  const body = {
    "model": "gpt-3.5-turbo-1106",
    "response_format": { "type": "json_object" },
    "messages": [
      {
        "role": "system",
        "content": "You are a helpful assistant designed to output JSON."
      },
      {
        "role": "user",
        "content": "Given following data in json format:" + "\n \n" + input + "\n \n" + query + "\n \n" + "Please name the first key \"response\". Further, replace in urgency_code every H with a 3, M with a 2 and L with a 1 in the resulting json and store it as a number (not as a String!)."
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

module.exports = ProcessorsService