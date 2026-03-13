const createCrudModel = require("./createCrudModel");

module.exports = createCrudModel({
  tableName: "alert_subscriptions",
  fields: ["user_id", "region", "incident_category_id"]
});
