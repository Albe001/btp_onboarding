# Navigation

**Previous Steps**
[Add Fiori Elements UIs](03_Add_Fiori_Elements_UIs.md).

[Table of Contents](Table_of_Contents.md).

[CAP Documentation](https://cap.cloud.sap/docs/).

**Next Steps:**
[Use a Local Launch Page](05_Use_a_Local_Launch_Page.md).

## Add Custom Logic 

In this tutorial, you add some custom code to the CAP application. Depending on the contents of the property `title`, the custom code changes the value of the property `urgency_`.

1. Create a new file `proccessors-service.js` in the `srv` folder of your application.

> **_NOTE:_** The [CAP event handler documentation](https://cap.cloud.sap/docs/java/provisioning-api#handlerclasses) might clarify ambiguities here.

3. Add the following code (the actual business logic) to this file:

```js

const cds = require('@sap/cds')

class ProcessorsService extends cds.ApplicationService {
  /** Registering custom event handlers */
  init() {
    this.before("UPDATE", "Incidents", (req) => this.onUpdate(req));
    this.before("CREATE", "Incidents", (req) => this.changeUrgencyDueToSubject(req.data));
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

  /** Custom Validation */
  async onUpdate (req) {
    const { status_code } = await SELECT.one(req.subject, i => i.status_code).where({ID: req.data.ID})
    if (status_code === 'C')
      return req.reject(`Can't modify a closed incident`)
  }
}
module.exports = ProcessorsService
```

3. In your browser, reload the page ofthe SAP Fiori elements app.

> **_NOTE:_** It is now possible to create new incidents in the SAP Fiori elements app.

> **_INFO:_** Because your file is called `processors-service.js` and, therefore, has the same name
> as your application definition file `srv/processors-service.cds`, CAP automatically treats it as a
> handler file for the application defined in there. CAP exposes several events and you can easily
> write handlers like the above.

# Navigation

**Previous Steps**
[Add Fiori Elements UIs](03_Add_Fiori_Elements_UIs.md).

[Table of Contents](Table_of_Contents.md).

**Next Steps:**
[Use a Local Launch Page](05_Use_a_Local_Launch_Page.md).
