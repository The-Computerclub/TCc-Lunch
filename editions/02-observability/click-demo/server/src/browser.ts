import * as api from "click-demo-api";

window.addEventListener("click", async (event) => {
  window.document.body.className = "busy";
  try {
    const target = event.target as HTMLElement;
    const color = target.dataset.color as "red" | "green" | "blue" | "yellow";
    const result = await api.click(
      {
        contentType: null,
        parameters: { color },
      },
      {},
      { baseUrl: new URL("/", window.document.location.toString()) }
    );
  } finally {
    window.document.body.className = "";
  }
});
