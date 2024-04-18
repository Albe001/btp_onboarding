sap.ui.define([
  'sap/m/MessageToast',
  'sap/m/MessageBox',
  "sap/ui/core/mvc/ControllerExtension",
], (MessageToast, MessageBox, ControllerExtension) => ControllerExtension.extend('ns.incidents.controller.ListReportExt', {
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

    await oEvent.getSource().oParent.getObjectBinding().execute().then((oData) => {
      const aiResponse = JSON.parse(oEvent.getSource().oParent.getObjectBinding().getBoundContext().getObject().value);
      const jsonModel = new sap.ui.model.json.JSONModel(aiResponse);
      sap.ui.getCore().byId("idVizFrame").setModel(jsonModel);
    });
  },

  onUploadDialogClose() {
    this.oUploadDialog.close();
  }
}));