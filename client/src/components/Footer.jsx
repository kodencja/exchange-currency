import React from "react";

function Footer({ onModalOpen }) {
  return (
    <footer className="down-buttons">
      <a href="https://codencja.herokuapp.com/">
        <button type="link" className="btn-down home-page-link">
          Back to Home Page
        </button>
      </a>
      <button
        type="button"
        className="btn btn-down"
        onClick={(e) => {
          onModalOpen(true);
        }}
      >
        Code info
      </button>
    </footer>
  );
}

export default Footer;
