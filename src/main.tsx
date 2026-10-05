import React from "react";
import { createRoot } from "react-dom/client";

import { App } from "./App";
import "@fontsource/be-vietnam-pro/400.css";
import "@fontsource/be-vietnam-pro/500.css";
import "@fontsource/be-vietnam-pro/600.css";
import "@fontsource/be-vietnam-pro/700.css";
import "./styles.css";

const root = document.getElementById("root");

if (!root) {
  throw new Error("Không tìm thấy phần tử #root để khởi tạo ứng dụng.");
}

createRoot(root).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
