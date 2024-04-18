# Navigation

**Previous Steps**
 [Use a Local Launch Page](05_Use_a_Local_Launch_Page.md).

[Table of Contents](Table_of_Contents.md).

[CAP Documentation](https://cap.cloud.sap/docs/).

**Next Steps:**
[Prepare for Production](07_Prepare_for_Production.md).

## adding CAP Role Restrictions to Entities (Optional!)

> **_INFO:_** This onboarding step is completely optional and just a PoC of how authorization works with CAP.

1. Open the file `srv/processors-service.cds`.

2. Add the following restrictions block (`@(...)`) to your service.

```js
using { sap.capire.incidents as my } from '../db/schema';

/**
 * Used by support team members to process Incidents
 */
service ProcessorsService  {
  ...
}

annotate ProcessorsService with @(requires: 'support'); //[!code focus]
```

With this change, a user with the role `support` can view and change the incidents and customers.

## Add Mocked Users for Local Testing

CAP offers a possibility to add local users for testing as part of the `cds` configuration. In this tutorial, we use the `development` profile in `package.json` file to add the users.

1. Add the following to the `cds requires` section in the `package.json` file:

```json
{
  "cds": {
    "requires": {
      "[development]": {
        "auth": {
          "kind": "mocked",
          "users": {}
        }
      }
    }
  }
}
```

This defines which configuration to use when running with the `development` profile.
Let's add some test users.

2. Replace the empty `users` object in the `package.json` with the following code:

```json
  "users": {
      "incident.support@tester.sap.com": {
        "password": "initial",
        "roles": ["support"]
      },
      "alice": {
         "roles": ["support"]
      },
      "bob": {
         "roles": ["support"]
      }
  }
```

## Access the Incident Management Application with Pasword

When accessing the `Incidents` service in your browser, you get a basic auth popup now, asking for your user and password. You can use the users to log in and see how it works.

1. With `cds watch` running, go to `https://port4004-workspaces-ws-9pjlw.us10.applicationstudio.cloud.sap/launchpage.html#Shell-home`.

2. Choose **Incidents** and choose **Go**.

3. Enter **Username**: `incident.support@tester.sap.com`.

4. Enter **Password**: `initial`.

You can now access the `Incidents` application.

# Navigation

**Previous Steps**
 [Use a Local Launch Page](05_Use_a_Local_Launch_Page.md).

[Table of Contents](Table_of_Contents.md).

**Next Steps:**
[Prepare for Production](07_Prepare_for_Production.md).
