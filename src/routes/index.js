const express = require("express");
const authController = require("../controllers/authController");
const usersController = require("../controllers/usersController");
const incidentCategoriesController = require("../controllers/incidentCategoriesController");
const checkpointsController = require("../controllers/checkpointsController");
const checkpointStatusHistoryController = require("../controllers/checkpointStatusHistoryController");
const incidentsController = require("../controllers/incidentsController");
const reportsController = require("../controllers/reportsController");
const reportVotesController = require("../controllers/reportVotesController");
const alertSubscriptionsController = require("../controllers/alertSubscriptionsController");
const alertsController = require("../controllers/alertsController");
const moderationLogsController = require("../controllers/moderationLogsController");
const externalIntegrationsController = require("../controllers/externalIntegrationsController");
const { authenticate, authorize } = require("../middleware/authenticate");
const { validateBody, validateIdParam, validateQuery } = require("../middleware/validateRequest");
const schemas = require("../validators/resourceSchemas");

const router = express.Router();
//Add health check endpoint
router.get("/health", (req, res) => {
    res.json({ status: "OK", message: "Server is running" });
});
router.post("/auth/register", validateBody(schemas.register), authController.register);
router.post("/auth/login", validateBody(schemas.login), authController.login);
router.post("/auth/refresh", validateBody(schemas.refreshToken), authController.refresh);
router.post("/auth/logout", validateBody(schemas.refreshToken), authController.logout);
router.post("/auth/logout-all", authenticate, authController.logoutAll);

router.get("/users", authenticate, authorize("admin"), usersController.getAllUsers);
router.get("/users/:id", authenticate, authorize("admin"), validateIdParam, usersController.getUserById);
router.post("/users", authenticate, authorize("admin"), validateBody(schemas.userCreate), usersController.createUser);
router.put("/users/:id", authenticate, authorize("admin"), validateIdParam, validateBody(schemas.userUpdate), usersController.updateUser);
router.delete("/users/:id", authenticate, authorize("admin"), validateIdParam, usersController.deleteUser);

router.get("/incident-categories", incidentCategoriesController.getAllIncidentCategories);
router.get("/incident-categories/:id", validateIdParam, incidentCategoriesController.getIncidentCategoryById);
router.post("/incident-categories", authenticate, authorize("admin", "moderator"), validateBody(schemas.incidentCategoryCreate), incidentCategoriesController.createIncidentCategory);
router.put("/incident-categories/:id", authenticate, authorize("admin", "moderator"), validateIdParam, validateBody(schemas.incidentCategoryUpdate), incidentCategoriesController.updateIncidentCategory);
router.delete("/incident-categories/:id", authenticate, authorize("admin"), validateIdParam, incidentCategoriesController.deleteIncidentCategory);

router.get("/checkpoints", checkpointsController.getAllCheckpoints);
router.get("/checkpoints/:id", validateIdParam, checkpointsController.getCheckpointById);
router.post("/checkpoints", authenticate, authorize("admin", "moderator"), validateBody(schemas.checkpointCreate), checkpointsController.createCheckpoint);
router.put("/checkpoints/:id", authenticate, authorize("admin", "moderator"), validateIdParam, validateBody(schemas.checkpointUpdate), checkpointsController.updateCheckpoint);
router.delete("/checkpoints/:id", authenticate, authorize("admin"), validateIdParam, checkpointsController.deleteCheckpoint);

router.get("/checkpoint-status-history", checkpointStatusHistoryController.getAllCheckpointStatusHistory);
router.get("/checkpoint-status-history/:id", validateIdParam, checkpointStatusHistoryController.getCheckpointStatusHistoryById);
router.post("/checkpoint-status-history", authenticate, authorize("admin", "moderator"), validateBody(schemas.checkpointStatusHistoryCreate), checkpointStatusHistoryController.createCheckpointStatusHistory);
router.put("/checkpoint-status-history/:id", authenticate, authorize("admin", "moderator"), validateIdParam, validateBody(schemas.checkpointStatusHistoryUpdate), checkpointStatusHistoryController.updateCheckpointStatusHistory);
router.delete("/checkpoint-status-history/:id", authenticate, authorize("admin"), validateIdParam, checkpointStatusHistoryController.deleteCheckpointStatusHistory);

router.get("/incidents", incidentsController.getAllIncidents);
router.get("/incidents/:id", validateIdParam, incidentsController.getIncidentById);
router.post("/incidents", authenticate, validateBody(schemas.incidentCreate), incidentsController.createIncident);
router.put("/incidents/:id", authenticate, validateIdParam, validateBody(schemas.incidentUpdate), incidentsController.updateIncident);
router.delete("/incidents/:id", authenticate, authorize("admin", "moderator"), validateIdParam, incidentsController.deleteIncident);

router.get("/reports", reportsController.getAllReports);
router.get("/reports/:id", validateIdParam, reportsController.getReportById);
router.post("/reports", authenticate, validateBody(schemas.reportCreate), reportsController.createReport);
router.put("/reports/:id", authenticate, validateIdParam, validateBody(schemas.reportUpdate), reportsController.updateReport);
router.delete("/reports/:id", authenticate, authorize("admin", "moderator"), validateIdParam, reportsController.deleteReport);

router.get("/report-votes", reportVotesController.getAllReportVotes);
router.get("/report-votes/:id", validateIdParam, reportVotesController.getReportVoteById);
router.post("/report-votes", authenticate, validateBody(schemas.reportVoteCreate), reportVotesController.createReportVote);
router.put("/report-votes/:id", authenticate, validateIdParam, validateBody(schemas.reportVoteUpdate), reportVotesController.updateReportVote);
router.delete("/report-votes/:id", authenticate, authorize("admin", "moderator"), validateIdParam, reportVotesController.deleteReportVote);

router.get("/alert-subscriptions", authenticate, alertSubscriptionsController.getAllAlertSubscriptions);
router.get("/alert-subscriptions/:id", authenticate, validateIdParam, alertSubscriptionsController.getAlertSubscriptionById);
router.post("/alert-subscriptions", authenticate, validateBody(schemas.alertSubscriptionCreate), alertSubscriptionsController.createAlertSubscription);
router.put("/alert-subscriptions/:id", authenticate, validateIdParam, validateBody(schemas.alertSubscriptionUpdate), alertSubscriptionsController.updateAlertSubscription);
router.delete("/alert-subscriptions/:id", authenticate, validateIdParam, alertSubscriptionsController.deleteAlertSubscription);

router.get("/alerts", alertsController.getAllAlerts);
router.get("/alerts/:id", validateIdParam, alertsController.getAlertById);
router.post("/alerts", authenticate, authorize("admin", "moderator"), validateBody(schemas.alertCreate), alertsController.createAlert);
router.put("/alerts/:id", authenticate, authorize("admin", "moderator"), validateIdParam, validateBody(schemas.alertUpdate), alertsController.updateAlert);
router.delete("/alerts/:id", authenticate, authorize("admin"), validateIdParam, alertsController.deleteAlert);

router.get("/moderation-logs", authenticate, authorize("admin", "moderator"), moderationLogsController.getAllModerationLogs);
router.get("/moderation-logs/:id", authenticate, authorize("admin", "moderator"), validateIdParam, moderationLogsController.getModerationLogById);
router.post("/moderation-logs", authenticate, authorize("admin", "moderator"), validateBody(schemas.moderationLogCreate), moderationLogsController.createModerationLog);
router.put("/moderation-logs/:id", authenticate, authorize("admin"), validateIdParam, validateBody(schemas.moderationLogUpdate), moderationLogsController.updateModerationLog);
router.delete("/moderation-logs/:id", authenticate, authorize("admin"), validateIdParam, moderationLogsController.deleteModerationLog);

router.get("/external/routes", validateQuery(schemas.externalRouteQuery), externalIntegrationsController.getRoute);
router.get("/external/context", validateQuery(schemas.externalContextQuery), externalIntegrationsController.getContextSnapshot);

module.exports = router;
