# Navigation

**Previous Steps**
[Set Up Launchpad](09_Set_Up_Launchpad.md).

[Table of Contents](Table_of_Contents.md).

[CAP Documentation](https://cap.cloud.sap/docs/).

**Next Steps**
[AI Analytics](11_AI_Analytics.md).

# Deploy in SAP BTP, Cloud Foundry Runtime

## Prerequisites

- Set up a global account in SAP BTP.

- User Role Assignment.

- Get the required SAP BTP service entitlements.

## Overview

The SAP BTP, Cloud Foundry environment allows you to create polyglot cloud applications in Cloud Foundry. It contains the SAP BTP, Cloud Foundry runtime, which is based on the open-source application platform managed by the Cloud Foundry Foundation.

1. Open the terminal by clicking the burger menu and choose **Terminal** &rarr; **New Terminal**.

We'll be using the Cloud MTA Build Tool to execute the deployment. The modules and services are configured in an `mta.yaml` deployment descriptor file that we have already generated

2. Run the following command to assemble everything into a single `mta.tar` archive:

```
mbt build
```

3. Make sure you're logged in to your subaccount:

```
cf api <API-ENDPOINT>
cf login -u <USER-ID> -p <PASSWORD>
cf target -o <ORG> -s <SPACE>
```

2. Run the following command to deploy the generated archive to Cloud Foundry:

```
cf deploy mta_archives/incident-management_1.0.0.mtar
```

This process can take some minutes and finally creates a log output like this:

```
[…]
Application "incident-management-approuter" started and available at
"[org]-[space]-incident-management.landscape-domain.com"
```

This is the URL of the app router application. Paste it in your browser to see your deployed application.


# Navigation

**Previous Steps**
[Set Up Launchpad](09_Set_Up_Launchpad.md).

[Table of Contents](Table_of_Contents.md).

[CAP Documentation](https://cap.cloud.sap/docs/).

**Next Steps**
[AI Analytics](11_AI_Analytics.md).
