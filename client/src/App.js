import React, { useState, useMemo, lazy, Suspense } from "react";
import Footer from "./components/Footer";

const CurrForm = lazy(() => import("./components/CurrForm"));
const ModalComp = lazy(() => import("./components/ModalComp"));

export const ModalContext = React.createContext();

function App() {
  const [modalIsOpen, setModalIsOpen] = useState(false);

  const valueModalContext = useMemo(() => {
    return {
      modalIsOpen,
      setModalIsOpen,
    };
  }, [modalIsOpen]);

  return (
    <div className="App">
      <main>
        <header className="title">LET'S CHECK EXCHANGE RATE</header>
        <div className="section-form">
          <Suspense fallback={<p>Loading...</p>}>
            <CurrForm />
          </Suspense>
        </div>
      </main>
      <Footer onModalOpen={setModalIsOpen} />
      <Suspense fallback={<p>Loading...</p>}>
        <ModalContext.Provider value={valueModalContext}>
          <ModalComp />
        </ModalContext.Provider>
      </Suspense>
    </div>
  );
}

export default App;
