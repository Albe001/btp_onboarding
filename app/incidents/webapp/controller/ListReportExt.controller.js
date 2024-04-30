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

  async openDiagram() {
    if (!this.oUploadDialog) {
      this.oUploadDialog = await this.base.getExtensionAPI().loadFragment({
        name: 'ns.incidents.ext.fragment.UploadDiagram',
        controller: this
      });
      this.getView().addDependent(this.oUploadDialog);
    }
    this.oUploadDialog.open();
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