const createCrudModel = require("./createCrudModel");

module.exports = createCrudModel({
  tableName: "checkpoint_status_history",
  fields: ["checkpoint_id", "status", "updated_by", "notes"]
});
