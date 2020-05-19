//jshint esversion:6

exports.getDate = function () {

  const today = new Date();

  const dateOptions = {
    weekday: 'long',
    month: 'long',
    day: 'numeric'
  };

  return today.toLocaleString("en-US", dateOptions);
};

exports.getDay = function () {

  const today = new Date();

  const dateOptions = {
    weekday: 'long'
  };

  return today.toLocaleString("en-US", dateOptions);
};
