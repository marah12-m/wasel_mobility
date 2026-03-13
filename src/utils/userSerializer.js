const sanitizeUser = (user) => {
  if (!user) {
    return user;
  }

  const { password, ...safeUser } = user;
  return safeUser;
};

const sanitizeUsers = (users) => users.map(sanitizeUser);

module.exports = {
  sanitizeUser,
  sanitizeUsers
};
