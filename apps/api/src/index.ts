import dotenv from "dotenv";
dotenv.config();

import { createApp } from "./app.js";

const app = createApp();
const PORT = process.env.API_PORT || 4000;

app.listen(PORT, () => {
  console.log(`[Nexora API] Listening on port ${PORT} (NODE_ENV: ${process.env.NODE_ENV || "development"})`);
});
