"use strict";

const assert = require("assert");
const faker = require("faker");
const sgRest = require("./rest");
const _ = require("lodash");

// setup envars
require("dotenv").config();

describe("AstraJS", () => {
  describe("SG REST Client", () => {
    it("should initialize an SG REST Client", async () => {
      const sgClient = await sgRest.createClient({
        username: process.env.STARGATE_DB_USERNAME,
        password: process.env.STARGATE_DB_PASSWORD,
        baseUrl: process.env.STARGATE_BASE_URL,
	debug: process.env.DEBUG
      });

      assert.notEqual(sgClient, null);
    });
  });

  describe("SG Document API", () => {
    // setup test context
    let sgClient = null;
    //const namespace = process.env.STARGATE_DB_KEYSPACE;
    const namespace = "myworld";
    const collection = "fitness";
    const documentId = faker.random.alphaNumeric(8);
    const collectionsPath = `/v2/namespaces/${namespace}/collections/${collection}`;
    const documentPath = `${collectionsPath}/${documentId}`;

    before(async () => {
      sgClient = await sgRest.createClient({
        username: process.env.STARGATE_DB_USERNAME,
        password: process.env.STARGATE_DB_PASSWORD,
        baseUrl: process.env.STARGATE_BASE_URL,
	debug: process.env.DEBUG
      });
    });

    it("should POST a document", async () => {
      await sgClient.post(documentPath, {
        firstName: "Cliff",
        lastName: "Wicklow",
	emails: ["cliff.wicklow@example.com"]
      });
      const res = await sgClient.get(documentPath);
      assert.equal(res.data.firstName, "Cliff");
      assert.equal(res.data.emails[0], "cliff.wicklow@example.com");
    });

    it("should PUT a document", async () => {
      await sgClient.put(documentPath, {
        firstName: "Cliff",
        lastName: "Wicklow",
        emails: ["cliff.wicklow@example.com"]
      });
      const res = await sgClient.get(documentPath);
      assert.equal(res.data.firstName, "Cliff");
      assert.equal(res.data.emails[0], "cliff.wicklow@example.com");
    });

    it("should PUT a document", async () => {
      await sgClient.put(documentPath, {
        firstName: "Roger",
        lastName: "Dodger",
        emails: ["rodger.Dodger@example.com"]
      });

      const res = await sgClient.get(documentPath);
      assert.equal(res.data.firstName, "Roger");
    });

    it("should PUT to a subdocument", async () => {
      await sgClient.put(`${documentPath}/addresses`, {
        "home": {
          "city": "New York",
          "state": "NY",
        },
      });

      const res = await sgClient.get(`${documentPath}/addresses`);
      assert.equal(res.data.home.city, "New York");
    });

    it("should PATCH a document", async () => {
      await sgClient.patch(`${documentPath}/addresses`, {
        "home": {
          "city": "Buffalo",
        },
      });

      const res = await sgClient.get(documentPath);
      assert.equal(res.data.addresses.home.city, "Buffalo");
    });

    //it("should DELETE a document", async () => {
    //  const res = await sgClient.delete(documentPath);
    //  assert.equal(res.status, 204);
    //});
  });
});
