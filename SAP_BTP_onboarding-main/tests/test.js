const cds = require('@sap/cds/lib');
const { default: axios } = require('axios');
const { GET, POST, DELETE, PATCH, expect } = cds.test(__dirname + '../../');

axios.defaults.auth = { username: "incident.support@tester.sap.com", password: "initial" }

jest.setTimeout(11111)

describe('Test The GET Endpoints', () => {
  it('Should check Processors Service', async () => {
    const processorsService = await cds.connect.to('ProcessorsService');
    const { Incidents } = processorsService.entities;
    expect(await SELECT.from(Incidents)).to.have.length(4);
  });

  it('Should check Customers', async () => {
    const processorsService = await cds.connect.to('ProcessorsService');
    const { Customers } = processorsService.entities;
    expect(await SELECT.from(Customers)).to.have.length(3);
  });

  it('Test Expand Entity Endpoint', async () => {
    const { data } = await GET`/odata/v4/processors/Customers?$select=firstName&$expand=incidents`;
    expect(data).to.be.an('object');
  });
});

describe('Draft Choreography APIs', () => {
  let draftId,incidentId;

  it('Create an incident ', async () => {
    const { status, statusText, data } = await POST(`/odata/v4/processors/Incidents`, {
      title: 'Urgent attention required !',
      status_code: 'N',
    });
    draftId = data.ID;
    expect(status).to.equal(201);
    expect(statusText).to.equal('Created');
  });

  it('+ Activate the draft & check Urgency code as H using custom logic', async () => {
    const response = await POST(
      `/odata/v4/processors/Incidents(ID=${draftId},IsActiveEntity=false)/ProcessorsService.draftActivate`
    );
    expect(response.status).to.eql(201);
    expect(response.data.urgency_code).to.eql('H');
  });

  it('+ Test the incident status', async () => {
    const { status, data: { status_code, ID } } = await GET(`/odata/v4/processors/Incidents(ID=${draftId},IsActiveEntity=true)`);
    incidentId = ID;
    expect(status).to.eql(200);
    expect(status_code).to.eql('N');
  });

  describe('Close Incident and Open it again to check Custom logic',()=>{

    it(`Should Close the Incident-${draftId}`, async ()=>{
      const {status} = await POST(`/odata/v4/processors/Incidents(ID=${incidentId},IsActiveEntity=true)/ProcessorsService.draftEdit`,
      {
        "PreserveChanges": true
       });
      expect(status).to.equal(201);
    });

    it(`Should Close the Incident-${draftId}`, async ()=>{
      const {status } = await PATCH(`/odata/v4/processors/Incidents(ID=${incidentId},IsActiveEntity=false)`,{status_code: 'C'});
      expect(status).to.equal(200);
    });
      it('+ Activate the draft & check Status code as C using custom logic', async () => {
        const response = await POST(
          `/odata/v4/processors/Incidents(ID=${incidentId},IsActiveEntity=false)/ProcessorsService.draftActivate`
        );
        expect(response.status).to.eql(200);
      });
    
      it('+ Test the incident status to be closed', async () => {
        const { status, data: { status_code } } = await GET(`/odata/v4/processors/Incidents(ID=${incidentId},IsActiveEntity=true)`);
        expect(status).to.eql(200);
        expect(status_code).to.eql('C');
      });
    describe('Should fail to re-open closed incident', ()=>{

      it(`Should Open Closed Incident-${draftId}`, async ()=>{
        const {status} = await POST(`/odata/v4/processors/Incidents(ID=${incidentId},IsActiveEntity=true)/ProcessorsService.draftEdit`,
        {
          "PreserveChanges": true
         });
        expect(status).to.equal(201);
      });

      it(`Should re-open the Incident-${draftId} but fail`, async ()=>{
        const {status } = await PATCH(`/odata/v4/processors/Incidents(ID=${incidentId},IsActiveEntity=false)`,{status_code: 'N'});
        expect(status).to.equal(200);
      });
        it(' `Should fail to activate draft trying to re-open the incidentt', async () => {
          try{
            const response = await POST(
              `/odata/v4/processors/Incidents(ID=${incidentId},IsActiveEntity=false)/ProcessorsService.draftActivate`
            );
          }catch(error){
            expect(error.response.status).to.eql(500);
            expect(error.response.data.error.message).to.include(`Can't modify a closed incident`);
          }  
        });
    })
  });

  it('- Delete the Incident', async () => {
    const response = await DELETE(`/odata/v4/processors/Incidents(ID=${draftId},IsActiveEntity=true)`);
    expect(response.status).to.eql(204);
  });
});