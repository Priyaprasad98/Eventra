exports.getLogin = (req, res, next) => {
  res.render("auth/login", {
    pageTitle: "Login",
    currentPage: "Login"
  });
};

exports.getSignup = (req, res, next) => {
  res.render("auth/signUp", {
    pageTitle: "Sign Up",
    currentPage: "Login"
  });
};

exports.postLogin = (req, res, next) => {
  const {email,password} = req.body;
  
};
