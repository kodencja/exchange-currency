const codeBack = `

/* server.js - file responsible for setting backend port,
 catching requests coming from frontend and re-direct them to controller.js throught routes */

 const express = require("express");
 const path = require("path");
 const cors = require("cors");
 
 const routes = require("./routes/routes");
 
 // Create a new express application named 'app'
 const app = express();
 
 // Set our backend port to be either an environment variable or port 5000
 const port = process.env.PORT || 5000;

// This application level middleware prints incoming requests to the servers console, useful to see incoming requests
app.use((req, res, next) => {
  console.log("Request_Endpoint: "+ req.method +" " +req.url");
  next();
});

// direct request through routes
app.use("/api", routes);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(cors());

// This middleware informs the express application to serve our compiled React files
if (
  process.env.NODE_ENV === "production" ||
  process.env.NODE_ENV === "staging"
) {
  app.use(express.static(path.join(__dirname, "./client/build")));

  // All other GET requests not handled before will return our React app
  app.get("*", (req, res) => {
    res.sendFile(path.resolve(__dirname, "./client/build", "index.html"));
  });
  console.log("Use other paths!");
}

// Catch any bad requests
app.get("*", (req, res) => {
  res.status(200).json({
    msg: "Catch All",
  });
});

app.use((req, res) => {
  res.status(404).json({ msg: "404" });
});

app.listen(port, () => {
  console.log("Server is running at port: " + port);
});


// routes.js  - create router

const express = require("express");
const controller = require("../controllers/controller");

// create a new instance of Router object - router is like a "mini-app" but doesn't do anything, we have to use router inside the app
const router = express.Router();

router.get("/countries", controller.countries);
router.get("/exchange", controller.exchange);

module.exports = router;



// controller.js - 
/* handling security issues
including validation of incoming api data, sending http requests with queries and handling the received data on the back side and send them back to frontend side */


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
        ].incorrect = 'The currency symbol cannot be shorter than' +min+ 'characters.';
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
            (country) => " " + country.name
          );
          feedback.fitCountries = fitCountries;
          res.json(feedback);
          feedback = { ...feedbackInit };
          return;
        }
      })
      .catch((err) => {
        if (err.hostname) {
          feedback.error = 'Not able to connect with' +err.hostname;
        } else {
          feedback.error = 'Unable to connect with' + err;
        }
        feedback.success = false;
        res.json(feedback);
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
          feedback = { ...feedbackInit };
          return;
        }
      })
      .catch((err) => {
        feedback.success = false;
        if (err.hostname) {
          feedback.error = 'Unable to connect with '+err.hostname;
        } else {
          feedback.error = 'Something went wrong!' +err;
        }
        res.json(feedback);
        feedback = { ...feedbackInit };
        return;
      });
  } else {
    feedback.success = false;
    feedback.inputCorrect = false;
    res.json(feedback);
    feedback = { ...feedbackInit };
    throw new Error("Some input has incorrect value!");
    // return;
  }
};

module.exports = { countries, exchange };

`;

module.exports = codeBack;
