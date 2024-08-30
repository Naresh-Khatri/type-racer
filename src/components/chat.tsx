import React, { useContext, useEffect, useRef, useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "./ui/button";
import { MessageCircle, SendHorizonal } from "lucide-react";
import { Input } from "./ui/input";
import { json } from "stream/consumers";
import { SocketContext } from "@/contexts/socketio";

type Message = { socketId: string; username: string; message: string };

const ChatMessage = () => {
  const { socket } = useContext(SocketContext);
  const [msgs, setMsgs] = useState<Message[]>([]);
  const inputRef = useRef<HTMLInputElement | null>(null);
  useEffect(() => {
    if (!socket) return;
    socket.on("receiveMsg", (msg) => {
      setMsgs((p) => [...p, msg]);
    });
    return () => {
      socket.off("receiveMsg");
    };
  }, []);
  const sendMsg = () => {
    if (!inputRef.current || !socket || !socket.id) return;
    const newMsg: Message = {
      socketId: socket.id,
      username: "user",
      message: inputRef.current.value,
    };
    socket.emit("sendMsg", newMsg, () => setMsgs((p) => [...p, newMsg]));
    inputRef.current.value = "";
  };
  return (
    <Sheet>
      <SheetTrigger>
        <Button>
          <MessageCircle className="w-5 h-5" /> Open Chat
        </Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>chat chat chat</SheetTitle>
          <SheetDescription>chat karlo frens</SheetDescription>
        </SheetHeader>
        <div className="h-[90%] w-full flex flex-col">
          <div className="w-full flex-1">
            {msgs.length === 0 ? (
              <div className="h-full flex justify-center items-center">
                <p className="text-center text-muted-foreground">no messages</p>
              </div>
            ) : (
              msgs.map((msg) => (
                <div>
                  <strong>{msg.socketId}</strong>: {msg.message}
                </div>
              ))
            )}
          </div>
          <div className="h-10 w-full flex flex-row gap-2">
            <Input
              placeholder="Enter message..."
              ref={inputRef}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  sendMsg();
                }
              }}
            />
            <Button className="flex gap-2" size={"sm"} onClick={sendMsg}>
              <p className="text-sm">Send</p>
              <SendHorizonal className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default ChatMessage;
