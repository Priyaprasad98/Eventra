exports.get404 = (req, res, next) => {
  res.render("error/404", {
    pageTitle: "Error-404",
    currentPage: ""
  });
};