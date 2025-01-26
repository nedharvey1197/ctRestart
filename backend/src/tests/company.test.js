const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const app = require('../index'); // Make sure to export app from index.js
const CompanyEnrichmentService = require('../services/companyEnrichmentService');
const axios = require('axios');

let mongoServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri());
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

describe('Company API', () => {
  test('Should create a new company', async () => {
    const response = await request(app)
      .post('/api/companies')
      .send({
        companyName: 'Test Company',
        companyWebsite: 'https://test.com',
        therapeuticArea: 'Oncology',
        phase: 'Phase 1',
        primaryEndpoint: 'Overall Survival',
        targetPopulation: 'Adult patients',
        trialDescription: 'Test trial description'
      });

    expect(response.status).toBe(201);
    expect(response.body.companyName).toBe('Test Company');
  });

  test('Should get company details', async () => {
    const company = await request(app)
      .post('/api/companies')
      .send({
        companyName: 'Test Company 2',
        therapeuticArea: 'Cardiology'
      });

    const response = await request(app)
      .get(`/api/companies/${company.body._id}`);

    expect(response.status).toBe(200);
    expect(response.body.companyName).toBe('Test Company 2');
  });
});

describe('CompanyEnrichmentService', () => {
  let service;
  
  beforeEach(() => {
    service = new CompanyEnrichmentService();
    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  describe('enrichCompanyData', () => {
    it('should extract therapeutic areas and technologies from Moderna website', async () => {
      // Mock the website content
      axios.get.mockResolvedValueOnce({
        data: `
          <html>
            <body>
              <div class="about">
                Moderna's mission is to deliver the greatest possible impact 
                to people through mRNA medicines. Our platform enables rapid design
                and testing of multiple mRNAs.
              </div>
              <div class="pipeline">
                Clinical trials ongoing in oncology and rare diseases.
                Using artificial intelligence to accelerate development.
              </div>
              <div class="locations">
                Headquartered in Cambridge, MA with global presence.
              </div>
            </body>
          </html>
        `
      });

      const result = await service.enrichCompanyData(
        'https://www.modernatx.com',
        'Moderna'
      );

      expect(result.enrichedFields.therapeuticAreas).toContain('mrna');
      expect(result.enrichedFields.therapeuticAreas).toContain('oncology');
      expect(result.enrichedFields.technologies).toContain('mrna platform');
      expect(result.enrichedFields.technologies).toContain('ai');
      expect(result.enrichedFields.locations).toContain('Cambridge');
    });

    it('should handle website scraping errors gracefully', async () => {
      axios.get.mockRejectedValueOnce(new Error('Failed to fetch'));

      const result = await service.enrichCompanyData(
        'https://invalid-url.com',
        'Test Company'
      );

      expect(result.enrichedFields.therapeuticAreas).toEqual([]);
      expect(result.enrichedFields.technologies).toEqual([]);
      expect(result.enrichedFields.locations).toEqual([]);
    });
  });
}); 