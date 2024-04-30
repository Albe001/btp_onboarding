# Navigation

**Previous Steps**
[AI Analytics](11_AI_Analytics.md).

[Table of Contents](Table_of_Contents.md).

[CAP Documentation](https://cap.cloud.sap/docs/).

## Custom Action

Similar to the previous onboarding step, we now want to use the AI. However, we now desire a visible diagram in the application. 
Ultimately we want on a given input query about hte incidents data the AI to evaluate this query and yield a JSON as result. THis JSON is then used as input for the diagramm to display.
Since for this action there is no template in CAP, we now need to handle the frontend ourselves as well.
Following section introduces our approach of implementing the frontend for our diagramm action.

## Frontend implementation

1. Navigate to app &rarr; incidents &rarr; webapp and open the `manifest.json` file. This file essentially states every UI that needs to be displayed in the webapp. Navigate to the `extentions` key and adapt it accordingly:

```json
"extends": {
    "extensions": {
        "sap.ui.controllerExtensions": {
            "sap.fe.templates.ListReport.ListReportController": {
                "controllerName": "ns.incidents.controller.ListReportExt"
            }
        }
    }
},
```

This initiates the usage of a controller for our new action. We now create exactly this controller. For that, create a new folder named `controller` under the `webapp` folder and in that `controller` folder create a new file called `ListReportExt.controller.js`. For now, we keep this file empty.

2. navigate back to the `manifest.json` file and navigate to the `controlConfiguration` key. Adapt that parameter accordingly:

```json
"controlConfiguration": {
    "@com.sap.vocabularies.UI.v1.LineItem": {
        "actions": {
            "openDiagram": {
                "id": "openUpDiagram",
                "text": "{{Generate_Diagram}}",
                "press": ".extension.ns.incidents.controller.ListReportExt.openDiagram",
                "requiresSelection": false
            }
        },
        "tableSettings": {
            "type": "ResponsiveTable"
        }
    }
}
```

Here, this initiates the usage of an Extention. Again, we now create this extention by creating a `ext` folder under the `webapp` folder and then create a new folder under the `ext` folder called `fragment`. Create a new file in the `fragment` folder called `UploadDiagram.fragment.xml`. The frament is the actual xml code for our desired diagram.

3. Open the `UploadDiagram.fragment.xml` file and following code:

```xml
<core:FragmentDefinition
    xmlns="sap.m"
    xmlns:upload="sap.m.upload"
    xmlns:core="sap.ui.core"
    xmlns:viz="sap.viz.ui5.controls"
    xmlns:layout="sap.ui.layout"
    xmlns:mvc="sap.ui.core.mvc"
    xmlns:viz.feeds="sap.viz.ui5.controls.common.feeds"
    xmlns:viz.data="sap.viz.ui5.data"
    height="100%"
>
    <Dialog
        id="_IDGenDialog1"
        title="{i18n>Generate_Diagram}"
    >
        <content>
            <VBox
                alignItems="Center"
                id="getUserQuery"
                binding="{/diagram(...)}"
            >
                <TextArea
                    width="300px"
                    id="_IDGenTextArea1"
                    value="{data>/Query}"
                    rows="4"
                    editable="false"
                />
                <Button
                    id="buttonId"
                    text="Evaluate Diagram"
                    press="onPress"
                />
            </VBox>
            <viz:VizFrame
                id="idVizFrame"
                uiConfig="{applicationSet:'fiori'}"
                height='400px'
                width="600px"
                vizType='bar'
            >
                <viz:dataset>
                    <viz.data:FlattenedDataset
                        id="_IDGenFlattenedDataset1"
                        data="{/response}"
                    >
                        <viz.data:dimensions>
                            <viz.data:DimensionDefinition
                                id="_IDGenDimensionDefinition1"
                                name="title"
                                value="{title}"
                            />
                        </viz.data:dimensions>
                        <viz.data:measures>
                            <viz.data:MeasureDefinition
                                id="_IDGenMeasureDefinition1"
                                name="urgency_code"
                                value="{urgency_code}"
                            />
                        </viz.data:measures>
                    </viz.data:FlattenedDataset>
                </viz:dataset>

                <viz:feeds>
                    <viz.feeds:FeedItem
                        id='valueAxisFeed'
                        uid="valueAxis"
                        type="Measure"
                        values="urgency_code"
                    />
                    <viz.feeds:FeedItem
                        id="_IDGenFeedItem1"
                        uid="categoryAxis"
                        type="Dimension"
                        values="title"
                    />
                </viz:feeds>
                <viz:dependents>
                    <viz:Popover id="idPopOver" />
                </viz:dependents>
            </viz:VizFrame>
        </content>
        <endButton>
            <Button
                id="_IDGenButton1"
                text="{i18n>CANCEL}"
                press=".onUploadDialogClose"
            />
        </endButton>
    </Dialog>
</core:FragmentDefinition>
```
In this file, the visualization of the diagram is defined. Further, we implement a `CANCEL` button that cancles the process of generating the diagram.

4. In order to get the date to the diagram, we first need to implement the controller. Insert following code into the `ListReportExt.controller.js` file:

```js
sap.ui.define([
  'sap/m/MessageToast',
  'sap/m/MessageBox',
  "sap/ui/core/mvc/ControllerExtension",
  "sap/ui/model/json/JSONModel"
], (MessageToast, MessageBox, ControllerExtension, JSONModel) => ControllerExtension.extend('ns.incidents.controller.ListReportExt', {
  override: {
    onBeforeRendering() {
      const dataModel = new JSONModel({
        Query: "Give me the title and urgency_code of all incidents.",
      });
      this.getView().setModel(dataModel, "data");
    },
  },

  async onPress(oEvent) {
    const sQuery = this.getView().getModel("data").getProperty("/Query");
    await oEvent.getSource().oParent.getObjectBinding().setParameter("Query", sQuery).execute().then((oData) => {
      const aiResponse = JSON.parse(oEvent.getSource().oParent.getObjectBinding().getBoundContext().getObject().value);
      const jsonModel = new sap.ui.model.json.JSONModel(aiResponse);
      sap.ui.getCore().byId("idVizFrame").setModel(jsonModel);
    });
  },

  onUploadDialogClose() {
    this.oUploadDialog.close();
  }
}));
```

The function `onBeforeRendering()` sets the values into the fragment. Mainly, the `onPress(oEvent)` function is relevant, since this function is executed whenn we press the button in order to generate the diagramm. This function waits for the answer from the AI (the `await` line) and then converts this answer to a suitable format and then sets the model of our diagramm with this data.

> **_NOTE:_** It is not obvious how this function gets the return from the AI. First, the implementation of the backend will be covered late in this guide and second, in our fragment, the textfield with the static input question is bounded to an action `binding="{/diagram(...)}"`. This results in the function `diagram` being executed in the backend when pressing the `Evaluate_Diagram` button.

## Backend implementation

5. After setting up all required parts in the frontend, we now focus on the backend part. This part contains some similarities to the [AI Analytics](11_AI_Analytics.md) step. Open the `prosessors-service.cds` file in the `srv` folder of the project. We now add a new function `diagram` to the service:

```
service ProcessorsService { 
  action checkAI (Query: String);
  function diagram (Query: String) returns LargeString;
  . . . 
}
```
> **_NOTE:_** For this use case, we implement a function, not an action since we only want to retrieve data.

6. For this function we need an event handler as well. For that, open the `processors-service.js` file. First, we update the `init` function:

```js
  init() {
    . . . 
    this.on("checkAI", (req) => this.onCheckAI(req));
    this.on("diagram", (req) => this.onDiagram(req));
    . . . 
  }
```

Now, it still remains to implement the `onDiagram(req)` function:

```js
class ProcessorsService extends cds.ApplicationService {
. . . 
  async onDiagram(req) {
    let incidents = await SELECT`ID,title,urgency_code,status_code`.from(this.entities.Incidents);
    let formattedIncidents = JSON.stringify(incidents);
    let userInput = req.data.Query;
    let bearerToken = await getToken();
    let response = await doDiagramQuery(bearerToken, userInput, formattedIncidents);

    return response.choices[0].message.content;
  }
. . . 
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
```

With that, the implementation of our custom action is completed.
With that, the onboarding guide is completed, **congratulations**! 

**Previous Steps**
[Deplay and Test App in SAP BTP](10_Deplay_and_Test_App_in_SAP_BTP.md).

[Table of Contents](Table_of_Contents.md).
