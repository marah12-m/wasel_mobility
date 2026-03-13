const createCrudModel = require("./createCrudModel");

module.exports = createCrudModel({
  tableName: "report_votes",
  fields: ["report_id", "user_id", "vote_type"]
});
