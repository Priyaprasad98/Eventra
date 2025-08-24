const { format } = require("date-fns");

const formatEventDate = (date) => {
  return format(new Date(date), "hh:mm a");
};

module.exports = formatEventDate;