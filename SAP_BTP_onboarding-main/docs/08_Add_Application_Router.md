# Navigation

**Previous Steps**
[Prepare for Production](07_Prepare_for_Production.md).

[Table of Contents](Table_of_Contents.md).

[CAP Documentation](https://cap.cloud.sap/docs/).

**Next Steps:**
[Set Up Launchpad](09_Set_Up_Launchpad.md).

## Overview

The application router acts as a single point-of-entry and routes requests to destinations 
specified in the application router's configuration. In particular, it ensures user login 
and authentication in combination with the SAP Authorization and Trust Management service (XSUAA). 
In addition, the application router also serves static content and rewrites URLs while 
propagating user information.

## Add Application Router Configuration

1. Create the folder `packages` in the root directory of the project and place a new folder `deploy-int` inside that.

2. Create a new folder `approuter` inside `packages/deploy-int`

3. Create a new file `xs-app.json` in the `approuter` folder and paste the following code snippet in the file:

```json
{
  "welcomeFile": "/cp.portal",
  "authenticationMethod": "route",
  "sessionTimeout": 30,
  "logout": {
      "logoutEndpoint": "/do/logout",
      "logoutPage": "/"
  },
  "routes": [
      {
          "source": "^/odata/v4/processors/(.*)$",
          "destination": "srv-api",
          "authenticationType": "xsuaa"
      }
   ]
}
```

This file has the configurations required for routing. The `welcomeFile` property is set to `/cp.portal` to start the portal.

3. Create a new file `package.json` in the `approuter` folder and paste the following code snippet in the file:

```json
{
  "name": "approuter",
  "dependencies": {
    "@sap/approuter": "^14.0.0"
  },
  "engines": {
    "node": "^18.0.0"
  },
  "scripts": {
    "start": "node node_modules/@sap/approuter/approuter.js"
  }
}
```

This file has the configurations to start the app router.

# Navigation

**Previous Steps**
[Prepare for Production](07_Prepare_for_Production.md).


[Table of Contents](Table_of_Contents.md).

**Next Steps:**
[Set Up Launchpad](09_Set_Up_Launchpad.md).
