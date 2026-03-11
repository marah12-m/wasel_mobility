const showAllAlertSubscriptions = (res, subscriptions) => {
  res.json({ success: true, data: subscriptions });
};

const showAlertSubscription = (res, subscription, statusCode = 200) => {
  res.status(statusCode).json({ success: true, data: subscription });
};

const showDeletedAlertSubscription = (res, id) => {
  res.json({ success: true, message: "Alert subscription deleted", data: { id: Number(id) } });
};

module.exports = {
  showAllAlertSubscriptions,
  showAlertSubscription,
  showDeletedAlertSubscription
};
