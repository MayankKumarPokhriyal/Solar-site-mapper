import dotenv from "dotenv";
import { createApp } from "./app.js";

// Load variables from server/.env before we read process.env.NREL_API_KEY.
dotenv.config();

const port = Number(process.env.PORT) || 3000;
const app = createApp();

app.listen(port, () => {
  console.log(`Solar Site Mapper API listening on http://localhost:${port}`);
});
