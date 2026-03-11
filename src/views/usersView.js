const showAllUsers = (res, users) => {
  res.json({ success: true, data: users });
};

const showUser = (res, user, statusCode = 200) => {
  res.status(statusCode).json({ success: true, data: user });
};

const showDeletedUser = (res, id) => {
  res.json({ success: true, message: "User deleted", data: { id: Number(id) } });
};

module.exports = {
  showAllUsers,
  showUser,
  showDeletedUser
};
