const createCrudModel = require("./createCrudModel");

module.exports = createCrudModel({
  tableName: "checkpoints",
  fields: ["name", "latitude", "longitude", "region", "description", "is_active"]
});
