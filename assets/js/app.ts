// Punto de entrada de Phoenix LiveView
import "../css/app.css";
import "phoenix_html";
import { Socket } from "phoenix";
import topbar from "../vendor/topbar";
import { LiveSocket } from "phoenix_live_view";

// Importar hooks
import Hooks from "./hooks";

let csrfToken = document.querySelector("meta[name='csrf-token']")?.getAttribute("content");

let liveSocket = new LiveSocket("/live", Socket, {
  params: { _csrf_token: csrfToken },
  hooks: Hooks
});

// Configurar topbar para carga de páginas
topbar.config({ barColors: { 0: "#e94560" }, shadowColor: "rgba(0, 0, 0, .3)" });

window.addEventListener("phx:page-loading-start", _info => topbar.show(300));
window.addEventListener("phx:page-loading-stop", _info => topbar.hide());

// Conectar al socket de Phoenix
liveSocket.connect();

// Exponer liveSocket para debugging
window.liveSocket = liveSocket;
