// Phase 2 真实终端前端：xterm.js + 后端 portable-pty。
// 仅在 Tauri 环境加载（由 TerminalArea 用 hasTauri 分流）。接口按多会话（pty_id），
// 本组件只对接当前活跃的单一 pty 实例。
import { useEffect, useRef } from "react";
import { Terminal } from "@xterm/xterm";
import { FitAddon } from "@xterm/addon-fit";
import { invoke } from "@tauri-apps/api/core";
import { listen, type UnlistenFn } from "@tauri-apps/api/event";

// 与后端 pty.rs 的 PtyPayload / SpawnResult 对应
interface PtyPayload {
  pty_id: number;
  data: string;
}
interface SpawnResult {
  pty_id: number;
}

const THEME_BG = "#1c1c1c"; // 与 --bg-terminal 一致
const THEME_FG = "#ececec"; // 终端亮文字

export default function XtermPane() {
  const ref = useRef<HTMLDivElement>(null);
  const termRef = useRef<Terminal | null>(null);
  const fitRef = useRef<FitAddon | null>(null);
  const idRef = useRef<number | null>(null);
  const unlistenRef = useRef<UnlistenFn | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const term = new Terminal({
      theme: { background: THEME_BG, foreground: THEME_FG, cursor: THEME_FG },
      fontFamily: "Consolas, 'SF Mono', Menlo, monospace",
      fontSize: 14, // 静态区实测 14.5，xterm 需整数，取 14
      cursorBlink: true,
      convertEol: false,
      allowProposedApi: true, // 供 onData/onExit 等稳定 API，保持配置完整
    });
    const fit = new FitAddon();
    term.loadAddon(fit);
    term.open(el);
    fit.fit();
    termRef.current = term;
    fitRef.current = fit;

    let disposed = false;

    (async () => {
      try {
        const { pty_id } = await invoke<SpawnResult>("pty_spawn", {
          args: { cols: term.cols, rows: term.rows },
        });
        if (disposed) return;
        idRef.current = pty_id;
        // 单事件通道，按 pty_id 过滤
        const un = await listen<PtyPayload>("pty:output", (e) => {
          if (e.payload.pty_id === idRef.current) term.write(e.payload.data);
        });
        if (disposed) {
          un();
        } else {
          unlistenRef.current = un;
        }
      } catch (e) {
        term.writeln(`\r\n[PTY 启动失败] ${e}`);
      }
    })();

    // 键入 → 写入后端
    const dataSub = term.onData((d) => {
      if (idRef.current != null) {
        invoke("pty_write", { args: { id: idRef.current, data: d } });
      }
    });
    // 粘贴 → 显式桥接写入后端
    const onPaste = (ev: ClipboardEvent) => {
      const text = ev.clipboardData?.getData("text") ?? "";
      if (text && idRef.current != null) {
        invoke("pty_write", { args: { id: idRef.current, data: text } });
      }
    };
    term.textarea?.addEventListener("paste", onPaste);

    // 容器尺寸变化 → fit + 通知后端 resize（含 pixel 尺寸，ConPTY 需要）
    let ro: ResizeObserver | null = null;
    if (typeof ResizeObserver !== "undefined") {
      ro = new ResizeObserver(() => {
        fit.fit();
        if (idRef.current != null) {
          invoke("pty_resize", {
            args: {
              id: idRef.current,
              cols: term.cols,
              rows: term.rows,
              pixel_width: el.clientWidth,
              pixel_height: el.clientHeight,
            },
          });
        }
      });
      ro.observe(el);
    }

    return () => {
      disposed = true;
      ro?.disconnect();
      term.textarea?.removeEventListener("paste", onPaste);
      dataSub.dispose();
      unlistenRef.current?.();
      const id = idRef.current;
      if (id != null) invoke("pty_kill", { args: { id } });
      term.dispose();
      termRef.current = null;
      idRef.current = null;
    };
  }, []);

  return (
    <div
      ref={ref}
      className="h-full min-h-0 w-full overflow-hidden"
      style={{ background: THEME_BG }}
    />
  );
}