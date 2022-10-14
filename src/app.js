import server from "./api/server.js";

const PORT = process.env.PORT || 5000;
const HOST = process.env.HOST || "localhost";

server.listen(PORT, HOST, () =>
  console.log(`Server is live at http://${HOST}:${PORT}`)
);
