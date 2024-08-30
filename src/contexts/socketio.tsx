"use client";
import React, { createContext, ReactNode, useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";

type SocketContextType = {
  socket: Socket | null;
};

const INITIAL_STATE: SocketContextType = {
  socket: null,
};

export const SocketContext = createContext<SocketContextType>(INITIAL_STATE);

const SocketContextProvider = ({ children }: { children: ReactNode }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  // SETUP SOCKET.IO
  useEffect(() => {
    const socket = io("ws://localhost:4000");
    setSocket(socket);
    socket.on("connect", () => {
      console.log(socket.id);
    });
    return () => {
      socket.disconnect();
    };
  }, []);

  return (
    <SocketContext.Provider value={{ socket: socket }}>
      {children}
    </SocketContext.Provider>
  );
};

export default SocketContextProvider;
