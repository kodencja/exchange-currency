const axios = require("axios");
const validator = require("validator");

const feedbackInit = {
  amountCheck: {},
  currFromCheck: {},
  currToCheck: {},
  fitCountries: [],
  exchRate: "",
  date: "",
  inputCorrect: false,
  success: false,
  error: "",
};

let feedback = { ...feedbackInit };

const handleValidation = (val, propName, methodName, min, max) => {
  console.log("during validation");
  return new Promise((resolve, reject) => {
    feedback[propName].incorrect = "";
    feedback[propName].ok = "";
    const valNoSpaces = val.split(" ").join("");

    if (valNoSpaces.length <= 0) {
      feedback[propName].incorrect = "Please fill in all fields in the form.";
      feedback[propName].ok = false;
      resolve(false);
    } else {
      if (methodName !== null && !validator[methodName](valNoSpaces)) {
        switch (propName) {
          case "currFromCheck":
            feedback[propName].incorrect =
              "Please use only English letters for currency symbol.";
            break;
          case "currToCheck":
            feedback[propName].incorrect =
              "Please use only English letters for currency symbol.";
            break;
          case "amountCheck":
            feedback[propName].incorrect =
              "Please use only numbers for amount.";
            break;
        }
        feedback[propName].ok = false;
        resolve();
      } else if (!validator.isLength(valNoSpaces, { min: min })) {
        feedback[
          propName
        ].incorrect = `The currency symbol cannot be shorter than ${min} characters.`;
        feedback[propName].ok = false;
        resolve();
      } else if (!validator.isLength(valNoSpaces, { max: max })) {
        feedback[propName].incorrect = "The currency symbol is too long.";
        feedback[propName].ok = false;
        resolve();
      } else {
        feedback[propName].ok = true;
        resolve();
      }
    }
  });
};

const checkIfValidationSuccess = (feedbackObj) => {
  return new Promise((resolve, reject) => {
    let successCheckArr = [];
    for (singleProp in feedbackObj) {
      if (feedbackObj[singleProp].hasOwnProperty("ok")) {
        successCheckArr.push(feedbackObj[singleProp].ok);
      }
    }
    resolve(successCheckArr);
  });
};

const countries = async (req, res, next) => {
  console.log("feedback start");
  // console.log(feedback);
  // console.log(req.query.urlAddress);

  await handleValidation(req.query.toCurrency, "currToCheck", "isAlpha", 3, 3);

  if (feedback.currToCheck.ok === true) {
    feedback.inputCorrect = true;
    axios
      .get(req.query.urlAddress)
      .then((response, err) => {
        if (err) {
          feedback.success = false;
          throw new Error(err);
        } else {
          feedback.success = true;

          const fitCountries = response.data.map(
            (country) => country.name + ", "
          );
          // console.log("fitCountries: ", fitCountries);
          feedback.fitCountries = fitCountries;
          res.json(feedback);
          feedback = { ...feedbackInit };
          return;
        }
      })
      .catch((err) => {
        if (err.hostname) {
          feedback.error = `Not able to connect with ${err.hostname}`;
        } else {
          feedback.error = `Unable to connect with ${err}`;
        }
        feedback.success = false;
        res.json(feedback);
        // feedback = { ...feedbackInit };
        return;
      });
  } else {
    feedback.success = false;
    feedback.inputCorrect = false;
    res.json(feedback);
    feedback = { ...feedbackInit };
    throw new Error("Some input has incorrect value!");
  }
};

const exchange = async (req, res) => {
  const toCurr = req.query.toCurrency;
  const fromCurr = req.query.fromCurrency;
  const figure = req.query.amount;
  // console.log("EXCHANGE ctrller");
  // console.log(req.query.urlAddress);

  await handleValidation(fromCurr, "currFromCheck", "isAlpha", 3, 3);
  await handleValidation(figure, "amountCheck", "isNumeric", 1, 7);

  // check if validation of all values was success
  const successArray = await checkIfValidationSuccess(feedback);

  // if there are no errors in input fields
  if (successArray.every((el) => el === true)) {
    feedback.inputCorrect = true;
    axios
      .get(req.query.urlAddress)
      .then((response, err) => {
        if (err) {
          feedback.success = false;
          throw new Error(err);
        } else {
          feedback.success = true;
          const rate = response.data.rates;
          let rateFrom, rateTo;
          if (fromCurr === "EUR") {
            rateFrom = 1;
          } else {
            rateFrom = rate[fromCurr];
          }
          if (toCurr === "EUR") {
            rateTo = 1;
          } else {
            rateTo = rate[toCurr];
          }
          const euro = 1 / rateFrom;
          const exchangeRate = euro * rateTo;
          feedback.exchRate = exchangeRate;
          feedback.date = response.data.date;
          res.json(feedback);
          console.log("feedback end success");
          console.log(feedback);
          feedback = { ...feedbackInit };
          return;
        }
      })
      .catch((err) => {
        feedback.success = false;
        if (err.hostname) {
          feedback.error = `Unable to connect with ${err.hostname}`;
        } else {
          feedback.error = `Something went wrong! ${err}`;
        }
        res.json(feedback);
        console.log("feedback end error1");
        console.log(feedback);
        feedback = { ...feedbackInit };
        return;
      });
  } else {
    feedback.success = false;
    feedback.inputCorrect = false;
    res.json(feedback);
    console.log("feedback end error2");
    console.log(feedback);
    feedback = { ...feedbackInit };
    throw new Error("Some input has incorrect value!");
    // return;
  }
};

module.exports = { countries, exchange };
