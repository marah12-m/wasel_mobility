const { createSchemaValidator } = require("./schemaValidator");

const roleEnum = ["citizen", "admin", "moderator"];
const severityEnum = ["low", "medium", "high", "critical"];
const incidentStatusEnum = ["open", "investigating", "resolved", "closed"];
const reportStatusEnum = ["pending", "reviewed", "resolved", "rejected", "duplicate"];
const voteTypeEnum = ["upvote", "downvote"];

const positiveInteger = {
  type: "integer",
  custom: (value) => value > 0
};

const decimalNumber = {
  type: "number"
};

const nullableInteger = {
  ...positiveInteger,
  nullable: true
};

const coordinateString = (min, max) => ({
  type: "string",
  required: true,
  custom: (value) => {
    if (typeof value !== "string" || value.trim() === "") {
      return false;
    }

    const parsed = Number(value);
    return Number.isFinite(parsed) && parsed >= min && parsed <= max;
  }
});

const schemas = {
  register: createSchemaValidator({
    name: { type: "string", required: true, minLength: 2, maxLength: 100 },
    email: { type: "email", required: true, maxLength: 150 },
    password: { type: "string", required: true, minLength: 8, maxLength: 255 },
    role: { type: "string", enum: roleEnum }
  }),
  login: createSchemaValidator({
    email: { type: "email", required: true, maxLength: 150 },
    password: { type: "string", required: true, minLength: 8, maxLength: 255 }
  }),
  refreshToken: createSchemaValidator({
    refreshToken: { type: "string", required: true, minLength: 32 }
  }),
  userCreate: createSchemaValidator({
    name: { type: "string", required: true, minLength: 2, maxLength: 100 },
    email: { type: "email", required: true, maxLength: 150 },
    password: { type: "string", required: true, minLength: 8, maxLength: 255 },
    role: { type: "string", required: true, enum: roleEnum }
  }),
  userUpdate: createSchemaValidator(
    {
      name: { type: "string", minLength: 2, maxLength: 100 },
      email: { type: "email", maxLength: 150 },
      password: { type: "string", minLength: 8, maxLength: 255 },
      role: { type: "string", enum: roleEnum }
    },
    { partial: true }
  ),
  incidentCategoryCreate: createSchemaValidator({
    name: { type: "string", required: true, minLength: 2, maxLength: 100 },
    description: { type: "string", maxLength: 2000, nullable: true }
  }),
  incidentCategoryUpdate: createSchemaValidator(
    {
      name: { type: "string", minLength: 2, maxLength: 100 },
      description: { type: "string", maxLength: 2000, nullable: true }
    },
    { partial: true }
  ),
  checkpointCreate: createSchemaValidator({
    name: { type: "string", required: true, minLength: 2, maxLength: 150 },
    latitude: { ...decimalNumber, required: true },
    longitude: { ...decimalNumber, required: true },
    region: { type: "string", maxLength: 100, nullable: true },
    description: { type: "string", maxLength: 2000, nullable: true },
    is_active: { type: "boolean", required: true }
  }),
  checkpointUpdate: createSchemaValidator(
    {
      name: { type: "string", minLength: 2, maxLength: 150 },
      latitude: decimalNumber,
      longitude: decimalNumber,
      region: { type: "string", maxLength: 100, nullable: true },
      description: { type: "string", maxLength: 2000, nullable: true },
      is_active: { type: "boolean" }
    },
    { partial: true }
  ),
  checkpointStatusHistoryCreate: createSchemaValidator({
    checkpoint_id: { ...positiveInteger, required: true },
    status: { type: "string", required: true, minLength: 2, maxLength: 50 },
    updated_by: nullableInteger,
    notes: { type: "string", maxLength: 2000, nullable: true }
  }),
  checkpointStatusHistoryUpdate: createSchemaValidator(
    {
      checkpoint_id: positiveInteger,
      status: { type: "string", minLength: 2, maxLength: 50 },
      updated_by: nullableInteger,
      notes: { type: "string", maxLength: 2000, nullable: true }
    },
    { partial: true }
  ),
  incidentCreate: createSchemaValidator({
    title: { type: "string", required: true, minLength: 2, maxLength: 200 },
    description: { type: "string", maxLength: 5000, nullable: true },
    incident_type: nullableInteger,
    severity: { type: "string", enum: severityEnum, nullable: true },
    latitude: { ...decimalNumber, nullable: true },
    longitude: { ...decimalNumber, nullable: true },
    status: { type: "string", enum: incidentStatusEnum, nullable: true },
    created_by: nullableInteger
  }),
  incidentUpdate: createSchemaValidator(
    {
      title: { type: "string", minLength: 2, maxLength: 200 },
      description: { type: "string", maxLength: 5000, nullable: true },
      incident_type: nullableInteger,
      severity: { type: "string", enum: severityEnum, nullable: true },
      latitude: { ...decimalNumber, nullable: true },
      longitude: { ...decimalNumber, nullable: true },
      status: { type: "string", enum: incidentStatusEnum, nullable: true },
      created_by: nullableInteger
    },
    { partial: true }
  ),
  reportCreate: createSchemaValidator({
    user_id: nullableInteger,
    category_id: nullableInteger,
    description: { type: "string", required: true, minLength: 2, maxLength: 5000 },
    latitude: { ...decimalNumber, nullable: true },
    longitude: { ...decimalNumber, nullable: true },
    status: { type: "string", enum: reportStatusEnum, nullable: true },
    duplicate_of: nullableInteger
  }),
  reportUpdate: createSchemaValidator(
    {
      user_id: nullableInteger,
      category_id: nullableInteger,
      description: { type: "string", minLength: 2, maxLength: 5000 },
      latitude: { ...decimalNumber, nullable: true },
      longitude: { ...decimalNumber, nullable: true },
      status: { type: "string", enum: reportStatusEnum, nullable: true },
      duplicate_of: nullableInteger
    },
    { partial: true }
  ),
  reportVoteCreate: createSchemaValidator({
    report_id: { ...positiveInteger, required: true },
    user_id: nullableInteger,
    vote_type: { type: "string", required: true, enum: voteTypeEnum }
  }),
  reportVoteUpdate: createSchemaValidator(
    {
      report_id: positiveInteger,
      user_id: nullableInteger,
      vote_type: { type: "string", enum: voteTypeEnum }
    },
    { partial: true }
  ),
  alertSubscriptionCreate: createSchemaValidator({
    user_id: nullableInteger,
    region: { type: "string", required: true, minLength: 2, maxLength: 100 },
    incident_category_id: nullableInteger
  }),
  alertSubscriptionUpdate: createSchemaValidator(
    {
      user_id: nullableInteger,
      region: { type: "string", minLength: 2, maxLength: 100 },
      incident_category_id: nullableInteger
    },
    { partial: true }
  ),
  alertCreate: createSchemaValidator({
    incident_id: nullableInteger,
    region: { type: "string", required: true, minLength: 2, maxLength: 100 },
    message: { type: "string", required: true, minLength: 2, maxLength: 5000 }
  }),
  alertUpdate: createSchemaValidator(
    {
      incident_id: nullableInteger,
      region: { type: "string", minLength: 2, maxLength: 100 },
      message: { type: "string", minLength: 2, maxLength: 5000 }
    },
    { partial: true }
  ),
  moderationLogCreate: createSchemaValidator({
    user_id: nullableInteger,
    action: { type: "string", required: true, minLength: 2, maxLength: 100 },
    target_type: { type: "string", required: true, minLength: 2, maxLength: 50 },
    target_id: { ...positiveInteger, required: true },
    notes: { type: "string", maxLength: 2000, nullable: true }
  }),
  moderationLogUpdate: createSchemaValidator(
    {
      user_id: nullableInteger,
      action: { type: "string", minLength: 2, maxLength: 100 },
      target_type: { type: "string", minLength: 2, maxLength: 50 },
      target_id: positiveInteger,
      notes: { type: "string", maxLength: 2000, nullable: true }
    },
    { partial: true }
  ),
  externalRouteQuery: createSchemaValidator({
    start_lat: coordinateString(-90, 90),
    start_lng: coordinateString(-180, 180),
    end_lat: coordinateString(-90, 90),
    end_lng: coordinateString(-180, 180),
    profile: {
      type: "string",
      enum: ["driving-car", "cycling-regular", "foot-walking"]
    }
  }),
  externalContextQuery: createSchemaValidator({
    latitude: coordinateString(-90, 90),
    longitude: coordinateString(-180, 180)
  })
};

module.exports = schemas;
