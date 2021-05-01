import React, { useContext } from "react";
import Modal from "react-modal";
import { ModalContext } from "../App";
import ModalContent from "./ModalContent";
import("./css/modalComp.css");

Modal.setAppElement("#root");

function ModalComp() {
  const modalContextValue = useContext(ModalContext);

  const { modalIsOpen, setModalIsOpen } = modalContextValue;

  return (
    <Modal
      className="dialog-box"
      isOpen={modalIsOpen}
      onRequestClose={() => setModalIsOpen(false)}
      shouldCloseOnOverlayClick={true}
      overlay={true}
    >
      <ModalContent />
    </Modal>
  );
}

export default React.memo(ModalComp);
