const express = require("express");
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

const router = express.Router();

router.get("/users", usersController.getAllUsers);
router.get("/users/:id", usersController.getUserById);
router.post("/users", usersController.createUser);
router.put("/users/:id", usersController.updateUser);
router.delete("/users/:id", usersController.deleteUser);

router.get("/incident-categories", incidentCategoriesController.getAllIncidentCategories);
router.get("/incident-categories/:id", incidentCategoriesController.getIncidentCategoryById);
router.post("/incident-categories", incidentCategoriesController.createIncidentCategory);
router.put("/incident-categories/:id", incidentCategoriesController.updateIncidentCategory);
router.delete("/incident-categories/:id", incidentCategoriesController.deleteIncidentCategory);

router.get("/checkpoints", checkpointsController.getAllCheckpoints);
router.get("/checkpoints/:id", checkpointsController.getCheckpointById);
router.post("/checkpoints", checkpointsController.createCheckpoint);
router.put("/checkpoints/:id", checkpointsController.updateCheckpoint);
router.delete("/checkpoints/:id", checkpointsController.deleteCheckpoint);

router.get("/checkpoint-status-history", checkpointStatusHistoryController.getAllCheckpointStatusHistory);
router.get("/checkpoint-status-history/:id", checkpointStatusHistoryController.getCheckpointStatusHistoryById);
router.post("/checkpoint-status-history", checkpointStatusHistoryController.createCheckpointStatusHistory);
router.put("/checkpoint-status-history/:id", checkpointStatusHistoryController.updateCheckpointStatusHistory);
router.delete("/checkpoint-status-history/:id", checkpointStatusHistoryController.deleteCheckpointStatusHistory);

router.get("/incidents", incidentsController.getAllIncidents);
router.get("/incidents/:id", incidentsController.getIncidentById);
router.post("/incidents", incidentsController.createIncident);
router.put("/incidents/:id", incidentsController.updateIncident);
router.delete("/incidents/:id", incidentsController.deleteIncident);

router.get("/reports", reportsController.getAllReports);
router.get("/reports/:id", reportsController.getReportById);
router.post("/reports", reportsController.createReport);
router.put("/reports/:id", reportsController.updateReport);
router.delete("/reports/:id", reportsController.deleteReport);

router.get("/report-votes", reportVotesController.getAllReportVotes);
router.get("/report-votes/:id", reportVotesController.getReportVoteById);
router.post("/report-votes", reportVotesController.createReportVote);
router.put("/report-votes/:id", reportVotesController.updateReportVote);
router.delete("/report-votes/:id", reportVotesController.deleteReportVote);

router.get("/alert-subscriptions", alertSubscriptionsController.getAllAlertSubscriptions);
router.get("/alert-subscriptions/:id", alertSubscriptionsController.getAlertSubscriptionById);
router.post("/alert-subscriptions", alertSubscriptionsController.createAlertSubscription);
router.put("/alert-subscriptions/:id", alertSubscriptionsController.updateAlertSubscription);
router.delete("/alert-subscriptions/:id", alertSubscriptionsController.deleteAlertSubscription);

router.get("/alerts", alertsController.getAllAlerts);
router.get("/alerts/:id", alertsController.getAlertById);
router.post("/alerts", alertsController.createAlert);
router.put("/alerts/:id", alertsController.updateAlert);
router.delete("/alerts/:id", alertsController.deleteAlert);

router.get("/moderation-logs", moderationLogsController.getAllModerationLogs);
router.get("/moderation-logs/:id", moderationLogsController.getModerationLogById);
router.post("/moderation-logs", moderationLogsController.createModerationLog);
router.put("/moderation-logs/:id", moderationLogsController.updateModerationLog);
router.delete("/moderation-logs/:id", moderationLogsController.deleteModerationLog);

module.exports = router;
