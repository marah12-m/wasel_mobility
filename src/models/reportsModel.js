const createCrudModel = require("./createCrudModel");

module.exports = createCrudModel({
  tableName: "reports",
  fields: ["user_id", "category_id", "description", "latitude", "longitude", "status", "duplicate_of"]
});
