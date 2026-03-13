const createCrudModel = require("./createCrudModel");

module.exports = createCrudModel({
  tableName: "moderation_logs",
  fields: ["user_id", "action", "target_type", "target_id", "notes"]
});
