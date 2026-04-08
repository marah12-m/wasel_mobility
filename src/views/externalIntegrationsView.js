const showExternalRoute = (res, route) => {
  res.json({ success: true, data: route });
};

const showExternalContext = (res, context) => {
  res.json({ success: true, data: context });
};

module.exports = {
  showExternalRoute,
  showExternalContext
};
