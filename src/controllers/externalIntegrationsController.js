const externalIntegrationsService = require("../services/externalIntegrationsService");
const {
  showExternalRoute,
  showExternalContext
} = require("../views/externalIntegrationsView");

const getRoute = async (req, res, next) => {
  try {
    const route = await externalIntegrationsService.getRoute(req.query);
    showExternalRoute(res, route);
  } catch (error) {
    next(error);
  }
};

const getContextSnapshot = async (req, res, next) => {
  try {
    const context = await externalIntegrationsService.getContextSnapshot(req.query);
    showExternalContext(res, context);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getRoute,
  getContextSnapshot
};
