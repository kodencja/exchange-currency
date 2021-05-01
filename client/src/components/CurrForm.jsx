import React, {
  useState,
  useCallback,
  useRef,
  useMemo,
  lazy,
  Suspense,
  useEffect,
} from "react";
import { useCurrencyEx } from "../customHooks/useCurrencyEx";
import "../main.css";

const FinalResponse = lazy(() => import("./FinalResponse"));

const currencyNamesFrom = [
  "USD",
  "EUR",
  "GBP",
  "CHF",
  "PLN",
  "CZK",
  "DKK",
  "HUF",
  "RON",
  "SEK",
  "NOK",
  "ISK",
  "HRK",
  "RUB",
  "TRY",
  "BRL",
  "AUD",
  "CAD",
  "CNY",
  "INR",
  "ILS",
  "MXN",
  "NZD",
  "PHP",
  "SGD",
  "ZAR",
  "IDR",
  "JPY",
  "THB",
  "BGN",
  "KRW",
  "MYR",
];

const currencyNamesTo = currencyNamesFrom.map((el, i) => {
  if (i === 0) return currencyNamesFrom[i + 1];
  else if (i === 1) return currencyNamesFrom[i - 1];
  else return el;
});

const initState = {
  loading: false,
  error: "",
  post: {},
  currFrom: "USD",
  currTo: "EUR",
  amount: 1,
};

const urlExchangeRate = "https://api.ratesapi.io/api/latest";
const urlCountries = "https://restcountries.eu/rest/v2/currency";

function CurrForm({ children }) {
  const { state, dispatch, convertCurrency } = useCurrencyEx(
    urlExchangeRate,
    urlCountries,
    initState
  );
  const [stateToResponse, setStateToResponse] = useState(state);

  const inputRef = useRef([]);

  const { currTo, currFrom, amount, loading, error } = state;

  const addToInputRef = useCallback((el) => {
    if (el && !inputRef.current.includes(el)) {
      inputRef.current.push(el);
    }
  }, []);

  useEffect(() => {
    inputRef.current[0].focus();
  }, []);

  // call and set finalResponse from FinalResponse.jsx
  useEffect(() => {
    setStateToResponse(state);
  }, [state.loading]);

  // handle focus on input fields while using the 'Enter' key
  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      // find index of the current input
      const inputIndex = inputRef.current.findIndex(
        (el) => el.id === e.target.id
      );

      // direct me to the next input in an array 'inputRef.current' if the current focus is not on the 'check / submit' button
      if (inputIndex < inputRef.current.length - 1) {
        e.preventDefault();
        inputRef.current[inputIndex + 1].focus();
      }
    }
  };

  const handleSubmit = async (event) => {
    console.log("handleSubmit Fn");
    // disable the check button to prevent client from double clicks
    inputRef.current[inputRef.current.length - 1].disabled = true;
    inputRef.current[inputRef.current.length - 1].innerHTML = "Wait...";
    dispatch({ type: "LOADING" });
    event.preventDefault();

    await convertCurrency(currFrom, currTo, amount);

    // after the 'convertCurrency' promise will be resolved enable the check button
    inputRef.current[inputRef.current.length - 1].disabled = false;
    inputRef.current[inputRef.current.length - 1].innerHTML = "Check";
  };

  const handleInputChange = useCallback(
    (e) => {
      dispatch({
        type: "INPUT",
        targetName: e.target.name,
        targetValue: e.target.value,
      });
    },
    [currTo, currFrom, amount]
  );

  const handleSwitch = useCallback(
    (event) => {
      console.log("handleSwitch Fn");
      event.preventDefault();
      dispatch({ type: "SWITCH" });
    },
    [currTo, currFrom]
  );

  const currencyList1 = useMemo(() => {
    if (currencyNamesFrom.length > 0) {
      const currNames1 = [...currencyNamesFrom].map((name, index) => {
        return (
          <option value={name} key={index}>
            {name}
          </option>
        );
      });
      return currNames1;
    } else {
      return false;
    }
  }, []);

  const currencyList2 = useMemo(() => {
    if (currencyNamesTo.length > 0) {
      const currNames2 = [...currencyNamesTo].map((name, index) => {
        return (
          <option key={index} value={name}>
            {name}
          </option>
        );
      });
      return currNames2;
    } else {
      return false;
    }
  }, []);

  return (
    <div className="container currency">
      <form id="currency-form" className="">
        <div className="row center">
          <div className="col col-sm-3 col-sm-marg form-group">
            <label htmlFor="amount">Amount</label>
            <div>
              <input
                type="number"
                className="form-control"
                name="amount"
                aria-label="Amount"
                id="amount"
                defaultValue="1"
                min="1"
                max="9999999"
                ref={addToInputRef}
                onKeyDown={handleKeyDown}
                onChange={handleInputChange}
              />
            </div>
          </div>
          <div className="col col-sm-3 col-sm-marg form-group">
            <label htmlFor="currFrom">From</label>
            <select
              name="currFrom"
              id="currFrom"
              className="form-control form-control-lg"
              value={currFrom}
              ref={addToInputRef}
              onKeyDown={handleKeyDown}
              onChange={handleInputChange}
            >
              {currencyList1}
            </select>
          </div>
          <div className="col col-sm-3 col-sm-marg form-group">
            <label htmlFor="currTo">To</label>
            <select
              name="currTo"
              id="currTo"
              className="form-control form-control-lg"
              value={currTo}
              ref={addToInputRef}
              onKeyDown={handleKeyDown}
              onChange={handleInputChange}
            >
              {currencyList2}
            </select>
          </div>
        </div>
        <div className="row center">
          <div className="buttons col">
            <button className="btn btn-info btn-switch" onClick={handleSwitch}>
              switch
            </button>
            <button
              type="submit"
              className="btn btn-success btn-check"
              ref={addToInputRef}
              onClick={handleSubmit}
            >
              Check
            </button>
          </div>
        </div>
      </form>
      <Suspense fallback={<p>Loading...</p>}>
        {loading === true && error === null ? (
          <span className="answer">loading...</span>
        ) : (
          <FinalResponse submitState={stateToResponse} />
        )}
      </Suspense>
    </div>
  );
}

export default CurrForm;
