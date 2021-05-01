import { useReducer } from "react";
import axios from "axios";

const reducer = (state, action) => {
  switch (action.type) {
    case "SUCCESS":
      return {
        ...state,
        loading: false,
        error: null,
        post: action.feedback,
      };
    case "ERROR":
      return {
        ...state,
        loading: false,
        post: {},
        error: action.error,
      };
    case "LOADING":
      return {
        ...state,
        loading: true,
        post: {},
        error: null,
      };

    case "INPUT":
      return {
        ...state,
        [action.targetName]: action.targetValue,
      };

    case "SWITCH":
      return {
        ...state,
        currFrom: state.currTo,
        currTo: state.currFrom,
      };
    default:
      return state;
  }
};

export const useCurrencyEx = (urlExchangeRate, urlCountries, initState) => {
  // the 'dispatch' function accepts object with the following properties:
  // type: it accepts 5 values:
  // 1 INPUT - to handle input onChenge event)
  // 2) SWITCH - to swap currency 'to' to 'from' and vice versa
  // 3) LOADING - when the server is wating for the request response
  // 4) SUCCESS - if the requests was success
  // 5) ERROR - when the request failed

  const [state, dispatch] = useReducer(reducer, initState);

  // ASYNC with PROMISE
  const getExchangeRate = async (fromCurrency, toCurrency, amount) => {
    // fetch data from the API where euro is the base currency
    try {
      const options = {
        method: "GET",
        headers: { "content-type": "application/json;charset=utf-8" },
        params: {
          urlAddress: urlExchangeRate,
          fromCurrency,
          toCurrency,
          amount,
        },
      };
      const feedbackRate = await axios.get("/api/exchange?", options);
      if (
        feedbackRate.data.success === false &&
        feedbackRate.data.inputCorrect === false
      ) {
        const errors =
          feedbackRate.data.currFromCheck.incorrect +
          " " +
          feedbackRate.data.amountCheck.incorrect;
        throw new Error(errors);
      } else if (
        feedbackRate.data.success === false &&
        feedbackRate.data.inputCorrect === true
      ) {
        throw new Error(feedbackRate.data.error);
      }
      return feedbackRate.data;
    } catch (error) {
      throw new Error(
        `Unable to get currency ${fromCurrency} and ${toCurrency} - ${error}`
      );
    }
  };

  const getCountries = async (toCurrency) => {
    try {
      const options = {
        method: "GET",
        headers: { "content-type": "application/json;charset=utf-8" },
        params: { urlAddress: `${urlCountries}/${toCurrency}`, toCurrency },
      };
      const feedback = await axios.get("/api/countries?", options);
      const countriesData = feedback.data;
      if (
        feedback.data.success === false &&
        feedback.data.inputCorrect === false
      ) {
        throw new Error(feedback.data.currToCheck.incorrect);
      } else if (
        feedback.data.success === false &&
        feedback.data.inputCorrect === true
      ) {
        throw new Error(feedback.data.error);
      }
      return countriesData;
    } catch (error) {
      throw new Error(
        `Unable to get countries using ${toCurrency} currency. ${error}`
      );
    }
  };

  const convertCurrency = (fromCurrency, toCurrency, amount) => {
    return new Promise(async (resolve, reject) => {
      try {
        const dataFeedbackCountries = await getCountries(toCurrency);
        if (dataFeedbackCountries.success === true) {
          const countriesList = dataFeedbackCountries.fitCountries;
          const dataFeedbackEx = await getExchangeRate(
            fromCurrency,
            toCurrency,
            amount
          );
          const convertedAmount = (amount * dataFeedbackEx.exchRate).toFixed(2);
          if (dataFeedbackEx.success === true) {
            const res = {
              result: convertedAmount,
              date: dataFeedbackEx.date,
              countries: countriesList,
              error: null,
            };
            dispatch({ type: "SUCCESS", feedback: res });
            resolve();
          } else {
            throw new Error("Something was wrong! " + dataFeedbackEx.error);
          }
        } else {
          throw new Error(
            "Something was wrong! " + dataFeedbackCountries.error
          );
        }
      } catch (error) {
        dispatch({
          type: "ERROR",
          error: error.message,
        });
        resolve();
      }
    });
  };

  return { state, dispatch, convertCurrency };
};
