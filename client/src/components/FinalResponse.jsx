import React, { useState, useEffect } from "react";

function FinalResponse({ submitState }) {
  const [feedbackTxt, setFeedbackTxt] = useState(false);

  const { loading, post, error, currTo, currFrom, amount } = submitState;

  console.log("FinalResponse Fn");

  useEffect(() => {
    let finalResponse;
    finalResponse =
      loading === false && error === null ? (
        <span>
          <div className="answer">
            <h2>
              {amount} {currFrom} ={" "}
            </h2>
            <h1>
              {post.result} {currTo}
            </h1>
          </div>
          <i> You can spend {currTo} in the following countries: </i>
          <div className="answer-countries">
            {post.countries.map((country, index) => (
              <span key={index}>{country}</span>
            ))}
            .
          </div>
          Date of rate: {post.date}.
          <p id="note">
            All figures are live mid-market rates, which are not available to
            consumers and are for informational purposes only
          </p>
        </span>
      ) : (
        <p className="answer">{error}</p>
      );
    setFeedbackTxt(finalResponse);
  }, [loading, error]);

  return (
    <div className="row feedback">
      <div className="col col-md-10" id="currResp">
        {feedbackTxt}
      </div>
    </div>
  );
}

export default React.memo(FinalResponse);
