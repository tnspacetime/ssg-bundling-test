import { R as React, j as jsxRuntimeExports } from "../index.js";
import "../__vite_rsc_assets_manifest.js";
import "node:async_hooks";
function ClientCounter() {
  const [count, setCount] = React.useState(0);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => setCount((count2) => count2 + 1), children: [
    "Client Counter: ",
    count
  ] });
}
const export_569ca76b06e4 = {
  ClientCounter
};
export {
  export_569ca76b06e4
};
