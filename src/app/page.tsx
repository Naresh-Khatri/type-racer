"use client";
import ChatMessage from "@/components/chat";
import { ThemeToggle } from "@/components/theme-toggler";
import Typer from "@/components/typer";
import { SocketContext } from "@/contexts/socketio";
import { useContext } from "react";

export default function Home() {
  const { socket } = useContext(SocketContext);

  if (!socket) {
    return <p>connecting to websocket...</p>;
  }

  return (
    <main className="flex min-h-screen flex-col items-center p-24">
      <p>connected as: {socket.id}</p>
      <ThemeToggle />
      <ChatMessage />
      <Typer />
    </main>
  );
}
