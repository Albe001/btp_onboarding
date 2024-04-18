# Navigation

**Previous Steps**
[Add Custom Logic](04_Add_Custom_Logic.md).

[Table of Contents](Table_of_Contents.md).

[CAP Documentation](https://cap.cloud.sap/docs/).

**Next Steps:**
[Add Authorization](06_Add_Authorization.md).

## Introduction

In the current implementation, you can open the `Incidents` application via the file 
`app/incidents/webapp/index.html` and there is no launch page. If you now create a second 
application using the SAP Fiori application generator within your project, it will be 
generated in the same way, again with its own `index.html` file. Instead, you can use a 
launch page for all the applications. You can add a launch page by creating an HTML file 
that uses the built-in UI5 shell in the `app` folder. Let's do that now.

## Implementation

1. Create a new file `launchpage.html` in the `app` folder of your app.

2. Copy the content below to the file `launchpage.html`.

```html
<!DOCTYPE html>
<html>
    <head>
        <meta http-equiv="X-UA-Compatible" content="IE=edge" />
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />

        <script>
            window['sap-ushell-config'] = {
                defaultRenderer: 'fiori2',
                applications: {
                    "incidents-app": {
                        title: 'Incident-Management',
                        description: 'Incidents',
                        additionalInformation: 'SAPUI5.Component=ns.incidents',
                        applicationType: 'URL',
                        url: "./incidents/webapp",
                        navigationMode: 'embedded'
                    }
            }
        }
        </script>
        <script src="https://ui5.sap.com/test-resources/sap/ushell/bootstrap/sandbox.js"></script>
        <script
            src="https://ui5.sap.com/resources/sap-ui-core.js"
            data-sap-ui-libs="sap.m, sap.ushell, sap.fe.templates"
            data-sap-ui-compatVersion="edge"
            data-sap-ui-theme="sap_fiori_3"
            data-sap-ui-frameOptions="allow"
            data-sap-ui-bindingSyntax="complex"
        ></script>
        <script>
            sap.ui.getCore().attachInit(function() {
                sap.ushell.Container.createRenderer().placeAt('content');
            });
        </script>
    </head>
    <body class="sapUiBody" id="content"></body>
</html>
```

3. `cds watch` running, open the app in your browser at `https://port4004-workspaces-ws-9pjlw.us10.applicationstudio.cloud.sap/launchpage.html#Shell-home`

4. You now see the `Incidents` app on the launch page.

## Check the launchpage.html file 

Let's have a look at the `launchpage.html` file and the configuration in there. In the first script you will see:

```html
	<script>
		window["sap-ushell-config"] = {
			defaultRenderer: "fiori2",
			applications: {
				"incidents-app": {
					title: "Incidents",
					description: "Incidents",
					additionalInformation: "SAPUI5.Component=ns.incidents",
					applicationType: "URL",
					url: "./incidents/webapp",
					navigationMode: "embedded"
				}
			}
		};
	</script>
```

> **_INFO:_** We name the file `launchpage.html` instead of `index.html`, because `cds watch` by default
> looks for an `index.html` file in hte `app` folder.  If `cds watch` finds such a file, it replaces the
> default page that also contains the links to the services with the `index.html` in the folder. While this
> makes sense in many cases, for development purposes we stick to the index page of CDS and give a different
> name to our index file.

There is a single application in the launch page with URL that points to it. 
There are other properties configured here like the title and description. Similarly, another 
application can be added to the launch page by adding an entry here.

## Next Steps

You have added a launch page for local testing. You can now configure who has access to 
your application. 

**Previous Steps**
[Add Custom Logic](04_Add_Custom_Logic.md).

[Table of Contents](Table_of_Contents.md).

**Next Steps:**
[Add Authorization](06_Add_Authorization.md).
