const PORT = process.env.PORT || 5000;
const dotenv = require("dotenv");
dotenv.config();
const io = require("socket.io")(PORT, {
  cors: {
    origin: process.env.CLIENT_URL,
  },
});
let users = [];
const addUser = (userId, socketId) => {
  !users.some((user) => user.userId === userId) &&
    users.push({ userId, socketId });
};

const removeUser = (socketId) => {
  users = users.filter((user) => user.socketId !== socketId);
};

const removeUserByUserId = (userId) => {
  users = users.filter((user) => user.userId !== userId);
};

const getUser = (userId) => {
  return users.find((user) => user.userId === userId);
};

io.on("connection", (socket) => {
  socket.on("addUser", (userId) => {
    addUser(userId, socket.id);
    io.emit("getUsers", users);
  });

  socket.on("removeCurrentUser", (userId) => {
    removeUserByUserId(userId);
    io.emit("getUsers", users);
  });

  socket.on("sendMessage", ({ senderId, receiverId, content, timestamp }) => {
    const user = getUser(receiverId);
    io.to(user.socketId).emit("getMessage", {
      senderId,
      receiverId,
      content,
      timestamp,
    });
  });

  socket.on("disconnect", () => {
    removeUser(socket.id);
    io.emit("getUsers", users);
  });

  socket.on("signout", ({ userId }) => {
    removeUserByUserId(userId);
    io.emit("getUsers", users);
  });
});
