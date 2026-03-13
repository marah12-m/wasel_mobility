const createCrudModel = require("./createCrudModel");

module.exports = createCrudModel({
  tableName: "incidents",
  fields: ["title", "description", "incident_type", "severity", "latitude", "longitude", "status", "created_by"]
});
