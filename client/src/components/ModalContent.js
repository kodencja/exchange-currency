import React, { useContext, useState, useMemo, lazy, Suspense } from "react";
import { ModalContext } from "../App";
import("./css/modalContent.css");

const BackCode = lazy(() => import("./BackCode"));

function ModalContent() {
  const modalContextValue = useContext(ModalContext);
  const [ifBackendCodeShow, setIfBackendCodeShow] = useState(false);

  const { setModalIsOpen } = modalContextValue;

  const backendDivStyle = useMemo(() => {
    let styleClasses;
    ifBackendCodeShow
      ? (styleClasses = "backend-info d-block")
      : (styleClasses = "backend-info d-none");
    return styleClasses;
  }, [ifBackendCodeShow]);

  return (
    <>
      <div className="btn-close2">
        <button
          className="btn close-btn border-dark btn-sm"
          onClick={() => setModalIsOpen(false)}
        >
          X
        </button>
      </div>

      <p className="title-code h5">Webdeveloping information</p>
      <div className="dialog-question dev-box">
        <div>
          <p>
            &nbsp;&nbsp;&nbsp;This page has its backend and frontend sides. The
            backend side was created in <b>NODE.JS</b> with support of libraries
            such as:
            <b> EXPRESS, PATH, CORS, AXIOS</b> (to make http requests),{" "}
            <b>CONCURRENTLY</b> and <b>VALIDATOR.JS</b> (to validate input
            values coming from requests from the frontend).{" "}
          </p>{" "}
          <p>
            &nbsp;&nbsp;&nbsp;The frontend side, on the other hand, was built in{" "}
            <b>REACT.JS</b> with functional components based on{" "}
            <b>HOOK tools</b> such as{" "}
            <b>useState, useReducer, useMemo, useCallback</b> and{" "}
            <b>useContext</b> as well as custom hook '<b>useCurrencyEx</b>'
            (advanced hook to deal with input values, sending data to backend
            and handling response coming to it). Other React libraries embrace:{" "}
            <b>createContext, lazy</b> and <b>suspense</b>. Some additional
            libraries used here include: <b>axios and react-modal</b>. Apart
            from using mouse and 'tab' key the <b>inputs focus</b> can be
            changed also with the ENTER key. Input values are validate both on
            frontend and backend sides. The components have been optimized
            appropriately.
          </p>
        </div>
        <aside className="aside-code">
          {" "}
          <button
            className="btn btn-sm close-btn border-dark"
            onClick={() => setIfBackendCodeShow(!ifBackendCodeShow)}
          >
            {ifBackendCodeShow ? "Hide the code" : "Show me the code"}
          </button>
          <div className={backendDivStyle}>
            <div className="code-content h4">BackEnd code</div>
            <Suspense fallback={<p>Loading...</p>}>
              <BackCode />
            </Suspense>
          </div>
        </aside>
      </div>
    </>
  );
}

export default React.memo(ModalContent);
