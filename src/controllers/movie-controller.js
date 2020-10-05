const Repository = require("../repository/repository");

exports.list = async function (req, res) {
  try {
    const { genres, period, pageNumber } = req.body;
    if (period) {
      const currentYear = new Date().getFullYear();
      if ((period.dateFrom && (period.dateFrom > currentYear))
          || (period.dateTo && (period.dateTo > currentYear))) {
        res.status(400).send(JSON.stringify({
          error: "Incorrect period chosen. Sorry, we don't have films from the future yet",
        }));
        return;
      } if (period.dateFrom && period.dateTo && (period.dateTo < period.dateFrom)) {
        res.status(400).send(JSON.stringify({
          error: "Incorrect period chosen. Second date should be after first one",
        }));
        return;
      }
    }
    const result = await Repository.getMovies(genres, period, pageNumber);
    if (result) {
      res.status(200).send(JSON.stringify(result));
    }
  } catch (err) {
    console.log(`error happened when trying to get data from database${JSON.stringify(err)}`);
    res.status(500).send(JSON.stringify({
      error: "error happened when trying to get data from database",
    }));
  }
};
