"use client";
import { ThemeToggle } from "@/components/theme-toggler";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { WORDS } from "@/data/words";
import { cn } from "@/lib/utils";
import { useEffect, useRef, useState } from "react";

const nonCharacterKeys = [
  "Shift",
  "Control",
  "Alt",
  "Meta",
  "CapsLock",
  "Tab",
  "Escape",
  "ArrowLeft",
  "ArrowUp",
  "ArrowRight",
  "ArrowDown",
  "Enter",
  "Backspace",
  "Delete",
  "Insert",
  "Home",
  "End",
  "PageUp",
  "PageDown",
];

export default function Home() {
  const [words, setWords] = useState<string[]>([]);
  const [cursor, setCursor] = useState({ wordIdx: 1, charIdx: 1 });
  const [errors, setErrors] = useState<Set<string>>(new Set());
  const [startTime, setStartTime] = useState(0);
  const [wordLimit, setWordLimit] = useState(30);
  const [gameEnded, setGameEnded] = useState(false);
  const [wordPressTimings, setWordPressTimings] = useState<number[]>([0, 0]);

  const cursorRef = useRef<HTMLDivElement>(null);

  const updateCursor = () => {
    const currWordRect = document
      .getElementById(`word-${cursor.wordIdx}`)
      ?.getBoundingClientRect();
    if (!cursorRef.current || !currWordRect) return;
    cursorRef.current.style.left = `calc(${currWordRect.left}px + ${cursor.charIdx}ch )`;
    cursorRef.current.style.top = currWordRect.top + "px";
  };
  const startGame = () => {
    setWords(WORDS.sort(() => Math.random() - 0.5).slice(0, wordLimit));
    setWordPressTimings(new Array(wordLimit).fill(0));
    setCursor({ wordIdx: 0, charIdx: 0 });
    setStartTime(Date.now());
  };
  // TODO: game end 2 bar chala
  // wps seems to be correct

  const handleGameEnd = () => {
    setGameEnded(true);
    wordPressTimings.pop();
    const diffMin =
      (wordPressTimings.at(-1)! - wordPressTimings[0]) / (60 * 1000);
    const wps = Math.round(wordLimit / diffMin);

    console.log("game ended", wps, wordLimit, diffMin);
  };

  useEffect(() => {
    startGame();
    if (typeof window !== "undefined") {
      document.addEventListener("keydown", (e) => {
        if (e.key === "Escape") startGame();
      });
    }
  }, [wordLimit]);
  useEffect(() => {
    if (words.length === 0) return;
    const captureCharKey = (e: KeyboardEvent) => {
      setCursor((prevCursor) => {
        // backspace with shift
        if (e.ctrlKey && e.key === "Backspace") {
          const newWordIdx = Math.max(prevCursor.wordIdx - 1, 0);
          const newCharIdx =
            prevCursor.wordIdx === 0 ? 0 : words[newWordIdx].length;
          return { wordIdx: newWordIdx, charIdx: newCharIdx };
        }
        //check backspace
        else if (e.key === "Backspace") {
          if (errors.has(`${prevCursor.wordIdx}:${prevCursor.charIdx - 1}`)) {
            setErrors((errs) => {
              const newSet = new Set(errs);
              newSet.delete(`${prevCursor.wordIdx}:${prevCursor.charIdx - 1}`);
              return newSet;
            });
          }
          if (prevCursor.wordIdx === 0 && prevCursor.charIdx === 0)
            return prevCursor;
          else if (prevCursor.charIdx > 0) {
            return { ...prevCursor, charIdx: prevCursor.charIdx - 1 };
          } else if (prevCursor.charIdx === 0) {
            return {
              wordIdx: prevCursor.wordIdx - 1,
              charIdx: words[prevCursor.wordIdx - 1].length,
            };
          }
        } else if (!nonCharacterKeys.includes(e.key)) {
          // bound the cursor to the end of the word
          if (
            cursor.wordIdx === words.length - 1 &&
            cursor.charIdx === words[cursor.wordIdx].length
          ) {
            handleGameEnd();
            return prevCursor;
          }

          // if cursor is at the end of the word and pressed space
          if (
            cursor.charIdx === words[cursor.wordIdx].length &&
            e.key === " "
          ) {
            console.log("going to next word");
            setWordPressTimings((p) => {
              const foo = [...p];
              foo[cursor.wordIdx] = Date.now();
              return foo;
            });
            return { wordIdx: cursor.wordIdx + 1, charIdx: 0 };
          }

          // check if equal
          const isCorrect = words[cursor.wordIdx][cursor.charIdx] === e.key;
          const charDiv = document.getElementById(`word-${cursor.wordIdx}`)
            ?.children[cursor.charIdx]! as HTMLDivElement;
          if (!charDiv) return prevCursor;
          setErrors((p) => {
            if (isCorrect) {
              const newSet = new Set(p);
              newSet.delete(`${cursor.wordIdx}:${cursor.charIdx}`);
              return newSet;
            } else {
              return p.add(`${cursor.wordIdx}:${cursor.charIdx}`);
            }
          });
          return { ...prevCursor, charIdx: prevCursor.charIdx + 1 };
        }
        //check letter
        return prevCursor; // return the same cursor if no changes
      });
    };
    //check letter
    document.addEventListener("keydown", captureCharKey);
    return () => {
      document.removeEventListener("keydown", captureCharKey);
    };
  }, [words, cursor]);
  useEffect(() => {
    updateCursor();
    window.onresize = updateCursor;
    return () => {
      window.onresize = null;
    };
  }, [words, cursor]);
  return (
    <main className="flex min-h-screen flex-col items-center p-24">
      <ThemeToggle />
      <pre>{JSON.stringify(cursor, null, 2)}</pre>
      <pre>{startTime}</pre>
      {/* <pre>{JSON.stringify(wordPressTimings)}</pre> */}
      <div className="flex flex-row gap-2">
        {["10", "25", "50", "100"].map((limit) => (
          <div key={limit}>
            <input
              type="radio"
              name={limit}
              value={limit}
              id={limit}
              checked={limit === wordLimit.toString()}
              onChange={(e) => setWordLimit(+e.target.value)}
            />
            <label htmlFor={limit}>{limit}</label>
          </div>
        ))}
      </div>
      {gameEnded ? (
        <pre>Game endeed</pre>
      ) : (
        <div
          className={cn(
            "max-w-5xl my-16 flex flex-wrap text-3xl",
            "font-mono tracking-wide"
          )}
        >
          <div ref={cursorRef} className="absolute left-0 top-0 cursor"></div>
          {words.map((word, wordIdx) => (
            <div
              key={wordIdx}
              className={cn(
                "h-fit mr-[1ch]",
                wordIdx >= cursor.wordIdx ? "text-slate-700" : ""
              )}
              id={`word-${wordIdx}`}
            >
              {word.split("").map((ch, chIdx) => (
                <span
                  key={chIdx}
                  id={"" + chIdx}
                  className={cn(
                    cursor.wordIdx === wordIdx
                      ? chIdx >= cursor.charIdx
                        ? "text-slate-700"
                        : "text-slate-200"
                      : "",
                    errors.has(`${wordIdx}:${chIdx}`) ? "text-red-500" : ""
                  )}
                >
                  {ch}
                </span>
              ))}
            </div>
          ))}
          <Button onClick={() => console.log(errors)}> show errors</Button>
        </div>
      )}
    </main>
  );
}
