import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import cors from "cors";
import allowCORS from "./src/middleware/allowCors";

const app = express();
app.use(allowCORS);

app.get("/", (req, res) => {
  res.status(200).json({ message: "hello" });
});
const httpServer = createServer(app);
const io = new Server(httpServer, {
  /* options */
  cors: {
    origin: "*",
  },
});
io.on("connection", (socket) => {
  console.log("someone joined", socket.id);
  socket.on("sendMsg", (msg, cb) => {
    console.log(msg);
    socket.broadcast.emit("receiveMsg", msg);
    cb('nice msg')
  });
});

httpServer.listen(4000, () => {
  console.log("listening on port 4000");
});
