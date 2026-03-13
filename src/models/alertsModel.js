const createCrudModel = require("./createCrudModel");

module.exports = createCrudModel({
  tableName: "alerts",
  fields: ["incident_id", "region", "message"]
});
