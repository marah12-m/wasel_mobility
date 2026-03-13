const createCrudModel = require("./createCrudModel");

module.exports = createCrudModel({
  tableName: "incident_categories",
  fields: ["name", "description"]
});
