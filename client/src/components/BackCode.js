import React from "react";
import codeBack from "./codeBack";

function BackCode() {
  console.log("BackCode render!");

  return (
    <pre className="pre-code">
      <code>{codeBack}</code>
    </pre>
  );
}

export default React.memo(BackCode);
