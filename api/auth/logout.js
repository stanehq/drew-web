const { clearSession } = require("../_lib/security");

module.exports = (request, response) => {
  clearSession(request, response);
  response.setHeader("Cache-Control", "no-store");
  return response.redirect(302, "/");
};
