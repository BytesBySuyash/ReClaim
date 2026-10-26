import React from "react"
import ReactDOM from "react-dom/client"
import App from "./App"
import "./index.css"
import { ReclaimProvider } from "./hooks/useReclaim"

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ReclaimProvider>
      <App />
    </ReclaimProvider>
  </React.StrictMode>,
)

