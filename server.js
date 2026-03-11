require("dotenv").config();

const express = require("express");
const apiRoutes = require("./src/routes");
const { notFoundHandler, errorHandler } = require("./src/middleware/errorHandler");

const app = express();
const port = Number(process.env.PORT) || 3000;

app.use(express.json());

app.get("/", (req, res) => {
  res.json({
    message: "Mobility Incident API is running",
    version: "v1"
  });
});

app.use("/api/v1", apiRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
