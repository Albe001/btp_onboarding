# Navigation

**Previous Steps**
 [Add Authorization](06_Add_Authorization.md).

[Table of Contents](Table_of_Contents.md).

[CAP Documentation](https://cap.cloud.sap/docs/).

**Next Steps:**
[Add Application Router](08_Add_Application_Router.md).

# Prepare for Prduction

If you followed CAP’s grow-as-you-go approach so far, you’ve developed your application with an 
in-memory database and basic/mock authentication. For production we need respective 
production-grade choices to be configured.

## All in One Step

**_Not Recommended!_** If you are already familiar with the steps below, you can execute the command below 
and skip the rest of the steps:

```
cds add hana,xsuaa --for production
```

Otherwise, please check out the sections below to understand the options in more details.

## Add SAP HANA

1. Run the following command in your project root folder:

```
cds add hana --for production
```

2. Run `cds watch` in your project folder and verify that your app still works locally at `https://port4004-workspaces-ws-9pjlw.us10.applicationstudio.cloud.sap/launchpage.html#Shell-home`

## Add XSUAA

1. Run the following command in your project folder:

```
cds add xsuaa --for production
```

What happens here? Running `cds add xsuaa` does two things:

Adds the SAP Authorization and Trust Management service (XSUAA) service to the `package.json` file of your project.
Creates the XSUAA security configuration for your project.

2. Check if the following lines have been added to the `package.json`:

```
{
  ...
  "cds": {
    "requires": {
      "[production]": {
        ...
        "auth": {
          "kind": "xsuaa"
        }
      }
    }
  }
}
```

3. Check the content of your `xs-security.json`.

## (Optional) Run a test Build

To validate everything is prepared as expected you can run a test build:

```
cds build --production
```

# Navigation

**Previous Steps**
 [Add Authorization](06_Add_Authorization.md).

[Table of Contents](Table_of_Contents.md).

**Next Steps:**
[Add Application Router](08_Add_Application_Router.md).
