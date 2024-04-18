# Navigation

**Previous Steps**
[Add Application Router](08_Add_Application_Router.md).

[Table of Contents](Table_of_Contents.md).

[CAP Documentation](https://cap.cloud.sap/docs/).

**Next Steps:**
[Deploy and Test App in SAP BTP](10_Deploy_and_Test_App_in_SAP_BTP.md).

# Add Lanchpad

In this tutorial, you will replace the launch page that we used for local testing 
with the Portal service. This will provide various features for your CAP 
application, including personalization, UI flexibility, and role-based visibility.

## Prerequisites

Make sure that your subaccount has quota for the Portal service and the HTML5 Applications Repository service
  for SAP BTP.

## Overview

The main steps in this tutorial are:

- Deploy the SAP Fiori elements app to the SAP HTML5 Applications Repository service.

- Create and deploy the configuration for the Portal service.
  
- Access the application through the Portal service.

## Using MTA

We’ll be using the **Cloud MTA Build Tool** to execute the deployment. 
The modules and services are configured in an `mta.yaml` deployment descriptor file.

Run the following command to generate your deployment descriptor:

```
cds add mta 
```

## Required Services

1. Right-click on the `mta.yaml` file and choose `Open With....`

2. Select `Text Editor` from the options that appear.

3. Add the following services to the `resources` section of the `mta.yaml` file:

```yaml
_schema-version: '3.1'
...
resources:
  ...
  - name: incident-management-portal
    type: org.cloudfoundry.managed-service
    parameters:
      service-plan: standard
      service: portal
```

```yaml
_schema-version: '3.1'
...
resources:
  ...
  - name: incident-management-html5-repo-runtime
    type: org.cloudfoundry.managed-service
    parameters:
      service-plan: app-runtime
      service: html5-apps-repo
```

```yaml
_schema-version: '3.1'
...
resources:
  ...
  - name: incident-management-html5-repo-host
    type: org.cloudfoundry.managed-service
    parameters:
      service-plan: app-host
      service: html5-apps-repo
```


- The `portal` service is required to deploy the Portal service content and access the Portal service via the application router.
- The `html5-apps-repo` service with plan `app-runtime` is required to access the HTML5 applications (SAP Fiori elements applications in this case) via the application router.
- The `html5-apps-repo` service with plan `app-host` is required to deploy the HTML5 applications to the SAP HTML5 Applications Repository service.

## Application Manifest

In this step, you add the intents `Incidents-display` to the application manifest 
(`manifest.json`) files.

## Add `Incidents-display`

1. Open the file `app/incidents/webapp/mainfest.json`.

2. Add the external navigation target to the `sap.app` JSON object.
   You can it right behind the `sourceTemplate` object:

```json
{
  "_version": "1.15.0",
  "sap.app": {
    "id": "ns.incidents",
    ...
    "crossNavigation": {
      "inbounds": {
        "intent1": {
          "signature": {
            "parameters": {},
            "additionalParameters": "allowed"
          },
          "semanticObject": "Incidents",
          "action": "display"
        }
      }
    },
  }
}
```

## Portal Content

1. Create a folder `portal-content` in the `packages/deploy-int` folder.

2. Create a new file `package.json` inside the `portal-content` folder
   and paste the following code snippet in the file:

```json
{
	"engines": {
		"node": ">=8.0.0"
	},
	"name": "site-content",
	"version": "3.17.0",
	"description": "portal site content deployer package",
	"license": "Apache-2.0",
	"author": "Portal Team",
	"dependencies": {
		"@sap/portal-cf-content-deployer": "^4.20.0-20220206072628"
	},
	"scripts": {
		"start": "node --harmony node_modules/@sap/portal-cf-content-deployer/src/index.js"
	}
}
```

3. Create a folder `portal-site` inside the `portal-content` folder.

4. create a new file `CommonDataModel.json` in the `portal-site` folder
   and paste the following code snippet in hte file:

```json
{
	"_version": "3.0.0",
	"identification": {
		"id": "f18acace-d86d-4b34-8233-e3be808d8ede-1587099697547",
		"entityType": "bundle"
	},
	"payload": {
		"catalogs": [{
			"_version": "3.0.0",
			"identification": {
				"id": "defaultCatalogId",
				"title": "{{title}}",
				"entityType": "catalog",
				"i18n": "i18n/defaultCatalogId.properties"
			},
			"payload": {
				"viz": []
			}
		}],
		"groups": [{
			"_version": "3.0.0",
			"identification": {
				"id": "defaultGroupId",
				"title": "{{title}}",
				"entityType": "group",
				"i18n": "i18n/defaultGroupId.properties"
			},
			"payload": {
				"viz": [{
					"id": "ns.incidents.display",
					"appId": "ns.incidents",
					"vizId": "Incidents-display"
				}]
			}
		}],
		"sites": [{
			"_version": "3.0.0",
			"identification": {
				"id": "fe74f769-a0ef-487f-8351-2b470c6cb40f-1587099697547",
				"entityType": "site",
				"title": "SAP Fiori launchpad site on Cloud Foundry",
				"description": "SAP Fiori launchpad site on Cloud Foundry, deployed from SAP Web IDE"
			},
			"payload": {
				"config": {
					"ushellConfig": {
						"renderers": {
							"fiori2": {
								"componentData": {
									"config": {
										"applications": {
											"Shell-home": {}
										},
										"enableSearch": false,
										"enablePersonalization": true,
										"enableSetTheme": true,
										"enableSetLanguage": true
									}
								}
							}
						}
					}
				},
				"groupsOrder": ["defaultGroupId"],
				"sap.cloud.portal": {
					"config": {
						"theme.id": "sap_fiori_3",
						"theme.active": ["sap_fiori_3", "sap_fiori_3_dark", "sap_belize_hcb", "sap_belize_hcw"],
						"ui5VersionNumber": "1.115.0"
					}
				}
			}
		}]
	}
}
```

5. Create a folder `i18n` inside the `portal-site` folder.

6. Create two new files `defaultCatalogId.properties` and `defaultGroupId.properties` in the `i18n`
   folder and paste the following code snippet in the file:

   - `i18n/defaultCatalogId.properties`:
  
```
#XTIT
title = Default Catalog Title
```

  - `i18n/defaultgroupId.properties`

```
#XTIT
title=Incident Management
```

The file `portal-content/portal-site/CommonDataModel.json` contains the configuration of the 
Portal service site. It defines one group `defaultGroupId` containing the Incident **Management** application.

The `appId` is the ID of the to be launched application and must match with the `id` from the 
`manifest.json` file of your CAP application. The `vizId` is the URL launcher of the application. 
If there are multiple apps added to the launchpad, `vizId` will act as the identifier. This 
information is filled as a combination of two fields from the `crossNavigation` object in 
`app/incidents/webapp/manifest.json`.

```json
 "crossNavigation": {
            "inbounds": {
              "intent1": {
                "signature": {
                  "parameters": {},
                  "additionalParameters": "allowed"
                },
                "semanticObject": "Incidents",
                "action": "display"
              }
            }
          }
```

## HTML5 Application Repository Deployment

The Portal service requires the UIs to be deployed to the SAP HTML5 Applications 
Repository service in order to find it.

1. Add the following modules to hte `mta.yaml` file: 

```yaml
_schema-version: '3.1'
...
modules:
  ...
  - name: incident-management-ui-resources
    type: com.sap.application.content
    path: gen/ui-resources
    requires:
      - name: incident-management-html5-repo-host
        parameters:
          content-target: true
    build-parameters:
      requires:
        - name: incident-management
          artifacts:
            - ./*.zip
          target-path: .
```

```yaml
_schema-version: '3.1'
...
modules:
  - name: incident-management
    type: html5
    path: app/incidents
    build-parameters:
      builder: custom
      commands:
        - npm install
        - npx -p @ui5/cli ui5 build --dest ../../gen/app/incidents/dist --include-task=generateManifestBundle --include-task=generateCachebusterInfo
        - bash -c "cd ../../gen/app/incidents/dist && npx bestzip ../incidents.zip *"
      supported-platforms: []
      build-result: ../../gen/app/incidents
```

The module `incident-management` will do the UI5 build. The build result contains a ZIP file 
containing optimized UI resources and a ZIP file `manifest-bundle.zip` with the `manifest.json` 
and the `i18n` files. The later is required by the Portal service.

The module `incident-management-ui-resources` is not an SAP BTP Cloud Foundry environment 
application. The MTA deployer will push its content, the ZIP files from the `incidents` build, 
to the SAP HTML5 Applications Repository service.

## Add `xs-app.json`

To upload an UI application to the SAP HTML5 Applications Repository service, it needs 
an `xs-app.json` file. The file tells the application router how to serve the application.

Create a file `app/incidents/webapp/xs-app.json` with the following content:

```json
{
  "authenticationMethod": "route",
  "logout": {
    "logoutEndpoint": "/do/logout"
  },
  "routes": [
    {
      "source": "^(.*)$",
      "target": "$1",
      "service": "html5-apps-repo-rt",
      "authenticationType": "xsuaa"
    }
  ]
}
```

## Portal Content Deployment

Add another module in the `mta.yml` file to deploy the content to the portal service:

```yaml
_schema-version: '3.1'
...
modules:
  ...
  - name: incident-management-portal-content-deployer
    type: com.sap.application.content
    path: packages/deploy-int/portal-content
    requires:
      - name: incident-management-portal
        parameters:
          content-target: true
          service-key:
            name: incident-management-portal-deploy-key
            config:
              content-endpoint: developer
      - name: incident-management-auth
      - name: incident-management-html5-repo-host
      - name: incident-management-ui-resources
```

## Add Service Bindings

Let's add service bindings for the SAP HTML5 Applications Repository Service and the Portal service.

1. Add the module `incident-management-approuter` and add the required service bindings to
   `html5-apps-repo` and `portal` to the module in the `mta.yaml` file:

```yaml
_schema-version: '3.1'
...
modules:
  ...
  - name: incident-management-approuter
    type: nodejs
    path: packages/deploy-int/approuter
    parameters:
      memory: 128M
    requires:
      - name: incident-management-auth
      - name: incident-management-portal
      - name: incident-management-html5-repo-runtime
      - name: srv-api
        group: destinations
        properties:
          forwardAuthToken: true
          strictSSL: true
          name: srv-api
          url: '~{srv-url}'
```

2. Add the following custom build options in the `mta.yaml` file:

```yaml
_schema-version: '3.1'
...
build-parameters:
  before-all:
   - builder: custom
     commands:
        - rm -rf incident-management-ui-deployer/resources
        - npm install --production
        - npx -p @sap/cds-dk cds build --production
        - mkdir gen/ui-resources
```

## Enable XSUAA for Token Exchange

The Portal service needs to know the users' identity, therefore it expects 
an OAuth2 JWT token with the user ID. But the JWT token that is created in the 
login process initiated by the application router isn't accepted by the Portal 
service because the service uses a different XSUAA instance.Therefore, the `xs-security.json` 
file needs to be extended by another role that adds the token.

Add the following `role-template` named `Token_Exchange` to the `xs-security.json` file:

```json
{
  ...
  "role-templates": [
    ...
    {
      "name": "Token_Exchange",
      "description": "UAA",
      "scope-references": [
        "uaa.user"
      ]
    }
  ]
}
```

# Navigation

**Previous Steps**
[Add Application Router](08_Add_Application_Router.md).


[Table of Contents](Table_of_Contents.md).

**Next Steps:**
[Deploy and Test App in SAP BTP](10_Deploy_and_Test_App_in_SAP_BTP.md).
