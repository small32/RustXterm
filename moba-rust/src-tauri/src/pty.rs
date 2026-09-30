// Phase 2 真实终端后端：portable-pty 创建 PTY，经 Tauri command + 事件与前端 xterm 桥接。
// 接口按多会话设计（事件带 pty_id，HashMap 缓存多 PTY），前端 Phase 2 只对接单活跃终端。
use portable_pty::{native_pty_system, CommandBuilder, Child, MasterPty, PtySize};
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::io::{Read, Write};
use std::sync::atomic::{AtomicU64, Ordering};
use std::sync::Mutex;
use std::thread::JoinHandle;
use tauri::{AppHandle, Emitter, State};

// —— 用户可见负载 ——
#[derive(Clone, Serialize)]
pub struct PtyPayload {
    pub pty_id: u64,
    pub data: String,
}

#[derive(Clone, Serialize)]
pub struct PtyExit {
    pub pty_id: u64,
}

#[derive(Serialize)]
pub struct SpawnResult {
    pub pty_id: u64,
}

// —— 命令参数 ——
#[derive(Deserialize)]
pub struct SpawnArgs {
    pub cols: u16,
    pub rows: u16,
}

#[derive(Deserialize)]
pub struct WriteArgs {
    pub id: u64,
    pub data: String,
}

#[derive(Deserialize)]
pub struct ResizeArgs {
    pub id: u64,
    pub cols: u16,
    pub rows: u16,
    pub pixel_width: u16,
    pub pixel_height: u16,
}

#[derive(Deserialize)]
pub struct KillArgs {
    pub id: u64,
}

// —— State ——
// master 用于 resize；writer 用于写入；process 用于 kill；reader 为阻塞读线程。
struct PtySession {
    pty_id: u64,
    master: Box<dyn MasterPty + Send>,
    writer: Option<Box<dyn Write + Send>>,
    process: Option<Box<dyn Child + Send + Sync>>,
    reader: Option<JoinHandle<()>>,
}

#[derive(Default)]
pub struct PtyState {
    sessions: Mutex<HashMap<u64, PtySession>>,
    next_id: AtomicU64,
}

// 跨平台默认 shell：macOS 读 $SHELL（兜底 /bin/zsh）；Windows 用 cmd.exe；其余 /bin/sh
fn shell() -> String {
    #[cfg(target_os = "macos")]
    {
        std::env::var("SHELL").unwrap_or_else(|_| "/bin/zsh".to_string())
    }
    #[cfg(target_os = "windows")]
    {
        "cmd.exe".to_string()
    }
    #[cfg(not(any(target_os = "macos", target_os = "windows")))]
    {
        std::env::var("SHELL").unwrap_or_else(|_| "/bin/sh".to_string())
    }
}

#[tauri::command]
pub fn pty_spawn(state: State<PtyState>, args: SpawnArgs, app: AppHandle) -> Result<SpawnResult, String> {
    let pty_id = state.next_id.fetch_add(1, Ordering::Relaxed);

    let pty_sys = native_pty_system();
    let pty = pty_sys
        .openpty(PtySize {
            rows: args.rows,
            cols: args.cols,
            pixel_width: 0,
            pixel_height: 0,
        })
        .map_err(|e| format!("openpty 失败: {e}"))?;

    let cmd = CommandBuilder::new(shell());
    let process = pty
        .slave
        .spawn_command(cmd)
        .map_err(|e| format!("spawn shell 失败: {e}"))?;

    // 主控读端：独立线程阻塞读，逐字节缓冲后 emit pty:output；EOF 时 emit pty:exit
    let mut reader = pty
        .master
        .try_clone_reader()
        .map_err(|e| format!("克隆读端失败: {e}"))?;
    let handle = app.clone();
    let reader_thread = std::thread::spawn(move || {
        let mut buf = [0u8; 4096];
        loop {
            let n = match reader.read(&mut buf) {
                Ok(0) | Err(_) => break,
                Ok(n) => n,
            };
            // 逐块 lossy 解析：read 可能切分多字节序列的极值较少，允许 U+FFFD 兜底
            let s = String::from_utf8_lossy(&buf[..n]);
            let _ = handle.emit(
                "pty:output",
                PtyPayload {
                    pty_id,
                    data: s.into_owned(),
                },
            );
        }
        let _ = handle.emit("pty:exit", PtyExit { pty_id });
    });

    let writer = pty
        .master
        .take_writer()
        .map_err(|e| format!("take_writer 失败: {e}"))?;
    {
        let mut sessions = state
            .sessions
            .lock()
            .map_err(|_| "sessions 锁失败".to_string())?;
        sessions.insert(
            pty_id,
            PtySession {
                pty_id,
                master: pty.master,
                writer: Some(writer),
                process: Some(process),
                reader: Some(reader_thread),
            },
        );
    }

    Ok(SpawnResult { pty_id })
}

#[tauri::command]
pub fn pty_write(state: State<PtyState>, args: WriteArgs) -> Result<(), String> {
    let mut sessions = state
        .sessions
        .lock()
        .map_err(|_| "sessions 锁失败".to_string())?;
    if let Some(s) = sessions.get_mut(&args.id) {
        if let Some(w) = s.writer.as_mut() {
            w.write_all(args.data.as_bytes())
                .map_err(|e| format!("pty_write 失败: {e}"))?;
            let _ = w.flush();
        }
    }
    Ok(())
}

#[tauri::command]
pub fn pty_resize(state: State<PtyState>, args: ResizeArgs) -> Result<(), String> {
    let sessions = state
        .sessions
        .lock()
        .map_err(|_| "sessions 锁失败".to_string())?;
    if let Some(s) = sessions.get(&args.id) {
        s.master
            .resize(PtySize {
                rows: args.rows,
                cols: args.cols,
                pixel_width: args.pixel_width,
                pixel_height: args.pixel_height,
            })
            .map_err(|e| format!("pty_resize 失败: {e}"))?;
    }
    Ok(())
}

#[tauri::command]
pub fn pty_kill(state: State<PtyState>, args: KillArgs) -> Result<(), String> {
    let mut sessions = state
        .sessions
        .lock()
        .map_err(|_| "sessions 锁失败".to_string())?;
    if let Some(mut s) = sessions.remove(&args.id) {
        if let Some(p) = s.process.as_mut() {
            let _ = p.kill();
        }
        if let Some(r) = s.reader.take() {
            let _ = r.join();
        }
    }
    Ok(())
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::time::Duration;

    // 集成测试：真实 spawn 默认 shell，写命令后应从 PTY 读回输出（不依赖 GUI）。
    #[test]
    fn pty_spawn_writes_and_reads() {
        let pty_sys = native_pty_system();
        let pty = pty_sys
            .openpty(PtySize { rows: 24, cols: 80, pixel_width: 0, pixel_height: 0 })
            .expect("openpty");
        let mut reader = pty.master.try_clone_reader().expect("clone reader");
        let mut writer = pty.master.take_writer().expect("take writer");
        let cmd = CommandBuilder::new(shell());
        let mut process = pty.slave.spawn_command(cmd).expect("spawn");

        // Windows 下 cmd 输出 "XPROMPT" 需写入换行触发；写一条 echo，随后 `exit`
        #[cfg(windows)]
        {
            let _ = writer.write_all(b"\r\necho MOBARUST_OK\r\nexit\r\n");
        }
        #[cfg(not(windows))]
        {
            let _ = writer.write_all(b"\necho MOBARUST_OK\nexit\n");
        }
        let _ = writer.flush();

        // 收集输出直到看到标记或超时
        let mut buf = String::new();
        let deadline = std::time::Instant::now() + Duration::from_secs(8);
        let mut chunk = [0u8; 512];
        while std::time::Instant::now() < deadline {
            if let Ok(n) = reader.read(&mut chunk) {
                if n == 0 {
                    break;
                }
                buf.push_str(&String::from_utf8_lossy(&chunk[..n]));
                if buf.contains("MOBARUST_OK") {
                    break;
                }
            }
            std::thread::sleep(Duration::from_millis(20));
        }
        let _ = process.kill();
        assert!(buf.contains("MOBARUST_OK"), "PTY 未回传 echo 输出，got: {buf:?}");
    }
}