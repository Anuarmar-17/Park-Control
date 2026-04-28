"use client";

import { useState, useEffect } from "react";

const pad = (n: number) => String(n).padStart(2, "0");

export function useClock(): string {
  const [time, setTime] = useState("");

  useEffect(() => {
    const tick = () => {
      const n = new Date();
      setTime(
        `${pad(n.getDate())}/${pad(n.getMonth() + 1)}/${n.getFullYear()} ` +
        `${pad(n.getHours())}:${pad(n.getMinutes())}:${pad(n.getSeconds())}`
      );
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  return time;
}
