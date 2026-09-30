// 终端区（pixel-spec §4.7）：底 #1c1c1c，行高 15px。
// 静态渲染 htop 输出。列布局按 ref 实测像素绝对定位（各列右缘 px，相对内容区左 244）：
// PID 61 / USER 左 69 / PRI 181 / NI 212 / VIRT 261 / RES 309 / SHR 357 / S 372 /
// CPU 420 / MEM 461 / TIME 532 / cmd 左 541。字体 Cascadia Mono 14（advance≈8，同 ref）。
// Phase 2 将替换为 xterm.js 实例。
const BRIGHT = "#ececec";
const CYAN = "#54ccef"; // 高亮底 / CPU% 底
const CYAN_TEXT = "#3bbbef"; // info 行文本青
const YELLOW = "#a6bd12"; // Mem 条黄
const GREEN = "#0eb16c"; // 表头底 / Main 底 / 绿字
const DARK = "#1c1c1c";
const MAGENTA = "#df4cf9"; // Mem 条品红
const BLUE = "#1bbae3"; // Mem 条蓝
const IO_BLUE = "#1296be"; // I/O 页签底
const DIM = "#7f7f7a"; // 灰字（值 / root / 零值）

interface Seg {
  t: string;
  c: string;
}

// 顶部信息行：label 左 36 青；值右对齐右缘 818；文本左 828
function InfoRow({ label, value, text }: { label: string; value?: Seg[]; text?: Seg[] }) {
  return (
    <div className="relative h-[15px] whitespace-pre">
      <span className="absolute" style={{ left: 36, color: CYAN_TEXT }}>
        {label}
      </span>
      {value && (
        <span className="absolute" style={{ right: 1920 - 244 - 818 }}>
          {value.map((s, i) => (
            <span key={i} style={{ color: s.c }}>
              {s.t}
            </span>
          ))}
        </span>
      )}
      {text && (
        <span className="absolute" style={{ left: 828 }}>
          {text.map((s, i) => (
            <span key={i} style={{ color: s.c }}>
              {s.t}
            </span>
          ))}
        </span>
      )}
    </div>
  );
}

interface Proc {
  pid: string;
  user: string;
  pri: string;
  ni: string;
  virt: string;
  res: string;
  shr: string;
  s: string;
  cpu: string;
  mem: string;
  time: string;
  cmd: string;
  cmdColor?: string;
  ipColor?: string; // cmd 尾部（IP）颜色
  hl?: boolean;
}

const G = GREEN; // cmd 绿色进程
const M = MAGENTA; // cmd 品红尾（IP）
const procs: Proc[] = [
  { pid: "2392", user: "small32", pri: "20", ni: "0", virt: "9616", res: "4864", shr: "2616", s: "R", cpu: "0.7", mem: "0.1", time: "3:43.43", cmd: "htop" },
  { pid: "1", user: "root", pri: "20", ni: "0", virt: "23936", res: "8864", shr: "6056", s: "S", cpu: "0.0", mem: "0.2", time: "0:06.95", cmd: "/sbin/init" },
  { pid: "450", user: "root", pri: "20", ni: "0", virt: "51068", res: "14804", shr: "14356", s: "S", cpu: "0.0", mem: "0.4", time: "0:03.17", cmd: "/usr/lib/systemd/systemd-journald" },
  { pid: "476", user: "systemd-ti", pri: "20", ni: "0", virt: "91908", res: "2952", shr: "2808", s: "S", cpu: "0.0", mem: "0.1", time: "0:00.56", cmd: "/usr/lib/systemd/systemd-timesyncd", cmdColor: G },
  { pid: "481", user: "root", pri: "20", ni: "0", virt: "36836", res: "4124", shr: "3604", s: "S", cpu: "0.0", mem: "0.1", time: "0:00.35", cmd: "/usr/lib/systemd/systemd-udevd" },
  { pid: "482", user: "systemd-ti", pri: "20", ni: "0", virt: "91908", res: "2952", shr: "0", s: "S", cpu: "0.0", mem: "0.1", time: "0:00.00", cmd: "/usr/lib/systemd/systemd-timesyncd", cmdColor: G },
  { pid: "809", user: "root", pri: "20", ni: "0", virt: "7088", res: "2256", shr: "2164", s: "S", cpu: "0.0", mem: "0.1", time: "0:00.27", cmd: "/usr/sbin/cron -f" },
  { pid: "810", user: "messagebus", pri: "20", ni: "0", virt: "8556", res: "2652", shr: "2152", s: "S", cpu: "0.0", mem: "0.1", time: "0:01.97", cmd: "/usr/bin/dbus-daemon --system --address=systemd: --nofork --nopidfile --systemd-activation --syslog-only" },
  { pid: "820", user: "root", pri: "20", ni: "0", virt: "19256", res: "5416", shr: "4892", s: "S", cpu: "0.0", mem: "0.1", time: "0:02.34", cmd: "/usr/lib/systemd/systemd-logind" },
  { pid: "824", user: "root", pri: "20", ni: "0", virt: "21216", res: "2352", shr: "2348", s: "S", cpu: "0.0", mem: "0.1", time: "0:00.02", cmd: "/usr/bin/VGAuthService" },
  { pid: "831", user: "root", pri: "20", ni: "0", virt: "247M", res: "4692", shr: "3976", s: "S", cpu: "0.0", mem: "0.1", time: "3:12.46", cmd: "/usr/bin/vmtoolsd", cmdColor: G },
  { pid: "852", user: "dhcpcd", pri: "20", ni: "0", virt: "10652", res: "1860", shr: "1568", s: "S", cpu: "0.0", mem: "0.0", time: "0:00.38", cmd: "dhcpcd: ens33 [ip4] [ip6]" },
  { pid: "857", user: "dhcpcd", pri: "20", ni: "0", virt: "10508", res: "1616", shr: "1404", s: "S", cpu: "0.0", mem: "0.0", time: "0:00.17", cmd: "dhcpcd: [privileged proxy] ens33 [ip4] [ip6]" },
  { pid: "858", user: "dhcpcd", pri: "20", ni: "0", virt: "10492", res: "788", shr: "784", s: "S", cpu: "0.0", mem: "0.0", time: "0:00.00", cmd: "dhcpcd: [network proxy] ens33 [ip4] [ip6]" },
  { pid: "859", user: "dhcpcd", pri: "20", ni: "0", virt: "10492", res: "948", shr: "904", s: "S", cpu: "0.0", mem: "0.0", time: "0:00.01", cmd: "dhcpcd: [control proxy] ens33 [ip4] [ip6]" },
  { pid: "881", user: "root", pri: "20", ni: "0", virt: "1223M", res: "19844", shr: "18036", s: "S", cpu: "0.5", mem: "0.5", time: "0:00.18", cmd: "/usr/local/xui/xui", cmdColor: G },
  { pid: "886", user: "root", pri: "20", ni: "0", virt: "8372", res: "1784", shr: "1780", s: "S", cpu: "0.0", mem: "0.0", time: "0:00.01", cmd: "/sbin/agetty -o -\\u --noclear -nuclear - linux" },
  { pid: "905", user: "root", pri: "20", ni: "0", virt: "11768", res: "4508", shr: "4124", s: "S", cpu: "0.0", mem: "0.1", time: "0:01.13", cmd: "sshd: /usr/sbin/sshd -D [listener] 0 of 10-100 startups" },
  { pid: "920", user: "root", pri: "20", ni: "0", virt: "1223M", res: "19844", shr: "0", s: "S", cpu: "0.5", mem: "0.5", time: "0:09.06", cmd: "/usr/local/xui/xui", cmdColor: G },
  { pid: "922", user: "root", pri: "20", ni: "0", virt: "1223M", res: "19844", shr: "0", s: "S", cpu: "0.5", mem: "0.5", time: "0:00.01", cmd: "/usr/local/xui/xui", cmdColor: G },
  { pid: "923", user: "root", pri: "20", ni: "0", virt: "1223M", res: "19844", shr: "0", s: "S", cpu: "0.5", mem: "0.5", time: "0:03.29", cmd: "/usr/local/xui/xui", cmdColor: G },
  { pid: "925", user: "root", pri: "20", ni: "0", virt: "1223M", res: "19844", shr: "0", s: "S", cpu: "0.5", mem: "0.5", time: "0:00.00", cmd: "/usr/local/xui/xui", cmdColor: G },
  { pid: "942", user: "root", pri: "20", ni: "0", virt: "1223M", res: "19844", shr: "0", s: "S", cpu: "0.5", mem: "0.5", time: "0:01.88", cmd: "/usr/local/xui/xui", cmdColor: G },
  { pid: "943", user: "root", pri: "20", ni: "0", virt: "247M", res: "4692", shr: "0", s: "S", cpu: "0.0", mem: "0.1", time: "0:00.00", cmd: "/usr/bin/vmtoolsd", cmdColor: G },
  { pid: "948", user: "root", pri: "20", ni: "0", virt: "247M", res: "4692", shr: "0", s: "S", cpu: "0.0", mem: "0.1", time: "0:08.28", cmd: "/usr/bin/vmtoolsd", cmdColor: G },
  { pid: "949", user: "root", pri: "20", ni: "0", virt: "247M", res: "4692", shr: "0", s: "S", cpu: "0.0", mem: "0.1", time: "0:00.00", cmd: "/usr/bin/vmtoolsd", cmdColor: G },
  { pid: "973", user: "root", pri: "20", ni: "0", virt: "1223M", res: "19844", shr: "0", s: "S", cpu: "0.5", mem: "0.5", time: "0:03.68", cmd: "/usr/local/xui/xui", cmdColor: G },
  { pid: "1021", user: "root", pri: "20", ni: "0", virt: "1223M", res: "19844", shr: "0", s: "S", cpu: "0.5", mem: "0.5", time: "0:03.72", cmd: "/usr/local/xui/xui", cmdColor: G },
  { pid: "1022", user: "root", pri: "20", ni: "0", virt: "1223M", res: "19844", shr: "0", s: "S", cpu: "0.5", mem: "0.5", time: "0:03.67", cmd: "/usr/local/xui/xui", cmdColor: G },
  { pid: "1921", user: "small32", pri: "20", ni: "0", virt: "21948", res: "1748", shr: "1744", s: "S", cpu: "0.0", mem: "0.4", time: "0:00.04", cmd: "/usr/lib/systemd/systemd --user" },
  { pid: "1924", user: "small32", pri: "20", ni: "0", virt: "24664", res: "928", shr: "924", s: "S", cpu: "0.0", mem: "0.0", time: "0:00.01", cmd: "(sd-pam)" },
  { pid: "2334", user: "root", pri: "20", ni: "0", virt: "19808", res: "3532", shr: "3308", s: "S", cpu: "0.0", mem: "0.1", time: "0:00.04", cmd: "sshd-session: small32 [priv]" },
  { pid: "2342", user: "root", pri: "20", ni: "0", virt: "19660", res: "2880", shr: "2872", s: "S", cpu: "0.0", mem: "0.1", time: "0:00.00", cmd: "sshd-session: small32 [priv]" },
  { pid: "2347", user: "small32", pri: "20", ni: "0", virt: "20312", res: "4172", shr: "3416", s: "S", cpu: "0.1", mem: "0.0", time: "2:14.36", cmd: "sshd-session: small32@pts/0" },
  { pid: "2349", user: "small32", pri: "20", ni: "0", virt: "9292", res: "2116", shr: "2112", s: "S", cpu: "0.0", mem: "0.1", time: "0:00.01", cmd: "-bash" },
  { pid: "2365", user: "small32", pri: "20", ni: "0", virt: "19916", res: "1560", shr: "1552", s: "S", cpu: "0.0", mem: "0.0", time: "0:00.00", cmd: "sshd-session: small32@notty" },
  { pid: "2366", user: "small32", pri: "20", ni: "0", virt: "2692", res: "1612", shr: "1608", s: "S", cpu: "0.0", mem: "0.0", time: "0:00.00", cmd: "/usr/lib/openssh/sftp-server" },
  { pid: "607972", user: "root", pri: "20", ni: "0", virt: "1223M", res: "19844", shr: "0", s: "S", cpu: "0.5", mem: "0.5", time: "0:02.42", cmd: "/usr/local/xui/xui", cmdColor: G },
  { pid: "997828", user: "dhcpcd", pri: "20", ni: "0", virt: "10508", res: "844", shr: "840", s: "S", cpu: "0.0", mem: "0.0", time: "0:00.00", cmd: "dhcpcd: [BPF ARP] ens33 192.168.98.130", ipColor: M },
  { pid: "997855", user: "dhcpcd", pri: "20", ni: "0", virt: "10508", res: "932", shr: "928", s: "S", cpu: "0.0", mem: "0.0", time: "0:00.00", cmd: "dhcpcd: [DHCP6 proxy] fe80::357a:c3ed:b4bc:eed0" },
  { pid: "997898", user: "dhcpcd", pri: "20", ni: "0", virt: "10508", res: "1216", shr: "1048", s: "S", cpu: "0.0", mem: "0.0", time: "0:00.02", cmd: "dhcpcd: [BOOTP proxy] 192.168.98.130", hl: true },
];

// 列右缘（px，相对内容区左）；USER 左对齐 left 69；cmd 左缘 541
const COLS: { k: keyof Proc; right: number }[] = [
  { k: "pid", right: 60 },
  { k: "pri", right: 180 },
  { k: "ni", right: 211 },
  { k: "virt", right: 260 },
  { k: "res", right: 308 },
  { k: "shr", right: 356 },
  { k: "s", right: 371 },
  { k: "cpu", right: 419 },
  { k: "mem", right: 460 },
  { k: "time", right: 531 },
];

function colColor(p: Proc, k: keyof Proc): string {
  if (p.hl) return DARK;
  const v = String(p[k]);
  switch (k) {
    case "user":
      return v === "root" ? DIM : v === "small32" ? BRIGHT : MAGENTA;
    case "virt":
    case "res":
    case "shr":
      return CYAN;
    case "s":
      return v === "R" ? GREEN : BRIGHT;
    case "cpu":
    case "mem":
    case "ni":
      return /^0(\.0+)?$/.test(v) ? DIM : BRIGHT;
    default:
      return BRIGHT;
  }
}

// Mem/Swp 条段：[段数, 颜色]
const MEM_SEGS: [number, string][] = [
  [7, GREEN],
  [1, MAGENTA],
  [3, BLUE],
  [67, YELLOW],
];

// F 键行字段（实测绝对 x，相对内容区左 244）：Fn 标签 + 文本
const fkeys: [string, number, string, number][] = [
  ["F1", 26, "Help", 68],
  ["F2", 132, "Setup", 157],
  ["F3", 196, "Search", 224],
  ["F4", 260, "Filter", 286],
  ["F5", 324, "Tree", 349],
  ["F6", 388, "SortBy", 409],
  ["F7", 452, "Nice", 473],
  ["F8", 516, "Nice +", 536],
  ["F9", 580, "Kill", 604],
  ["F10", 624, "Quit", 644],
];

export default function TerminalArea() {
  return (
    <div
      className="relative flex min-h-0 flex-1 flex-col overflow-hidden pt-[5px] text-[14.5px]"
      style={{
        background: "var(--bg-terminal)",
        lineHeight: "15px",
        fontFamily: "Consolas, 'SF Mono', Menlo, monospace",
      }}
    >
      {/* 首行前空 1 行 */}
      <div className="h-[15px]" />
      <InfoRow
        label="0["
        value={[{ t: "0.0%", c: DIM }, { t: "]", c: BRIGHT }]}
        text={[
          { t: "Tasks: ", c: CYAN_TEXT },
          { t: "28, ", c: BRIGHT },
          { t: "13", c: GREEN },
          { t: " thr, ", c: BRIGHT },
          { t: "187 kthr; ", c: CYAN_TEXT },
          { t: "1", c: GREEN },
          { t: " running", c: CYAN_TEXT },
        ]}
      />
      <InfoRow
        label="1["
        value={[{ t: "0.0%", c: DIM }, { t: "]", c: BRIGHT }]}
        text={[
          { t: "Load average: ", c: CYAN_TEXT },
          { t: "0.00 0.00 0.00", c: CYAN_TEXT },
        ]}
      />
      <InfoRow
        label="2["
        value={[{ t: "0.0%", c: DIM }, { t: "]", c: BRIGHT }]}
        text={[
          { t: "Uptime: ", c: CYAN_TEXT },
          { t: "21:01:55", c: CYAN_TEXT },
        ]}
      />
      <InfoRow label="3[" value={[{ t: "0.0%", c: DIM }, { t: "]", c: BRIGHT }]} />
      {/* Mem：label 左 20，条左 55（绿7/品红1/蓝3/黄67），值右对齐 + ] */}
      <div className="relative h-[15px] whitespace-pre">
        <span className="absolute" style={{ left: 20, color: CYAN_TEXT }}>
          {"Mem["}
        </span>
        {/* 条段逐格绝对定位（ref 格宽 8，ink 左缘；| 用 2px 宽块模拟左对齐 ink） */}
        {MEM_SEGS.flatMap(([n, c], gi) => {
          const base = MEM_SEGS.slice(0, gi).reduce((a, [m]) => a + m, 0);
          return Array.from({ length: n }, (_, i) => (
            <span
              key={`${gi}-${i}`}
              className="absolute"
              style={{ left: 55 + (base + i) * 8, width: 2, background: c, top: 2, height: 11 }}
            />
          ));
        })}
        <span className="absolute" style={{ right: 1920 - 244 - 818 }}>
          <span style={{ color: DIM }}>269M/3.79G</span>
          <span style={{ color: BRIGHT }}>]</span>
        </span>
      </div>
      <div className="relative h-[15px] whitespace-pre">
        <span className="absolute" style={{ left: 20, color: CYAN_TEXT }}>
          {"Swp["}
        </span>
        <span
          className="absolute"
          style={{ left: 63, width: 2, background: YELLOW, top: 2, height: 11 }}
        />
        <span className="absolute" style={{ right: 1920 - 244 - 818 }}>
          <span style={{ color: DIM }}>25.0M/4.00G</span>
          <span style={{ color: BRIGHT }}>]</span>
        </span>
      </div>
      {/* 空行实测 13px 后 Main / I/O 页签 */}
      <div className="h-[13px]" />
      <div className="relative h-[15px] whitespace-pre">
        <span className="absolute" style={{ left: 4, background: GREEN, color: DARK }}>
          {" Main "}
        </span>
        <span className="absolute" style={{ left: 42, background: IO_BLUE, color: DARK }}>
          {" I/O "}
        </span>
      </div>
      {/* 表头带（全宽绿底，CPU%▽ 青底） */}
      <div className="relative h-[15px] whitespace-pre" style={{ background: GREEN, color: DARK }}>
        <span className="absolute" style={{ left: 22 }}>{"  PID"}</span>
        <span className="absolute" style={{ left: 69 }}>USER</span>
        <span className="absolute" style={{ left: 158 }}>PRI</span>
        <span className="absolute" style={{ left: 197 }}>NI</span>
        <span className="absolute" style={{ left: 229 }}>VIRT</span>
        <span className="absolute" style={{ left: 285 }}>RES</span>
        <span className="absolute" style={{ left: 333 }}>SHR</span>
        <span className="absolute" style={{ left: 365 }}>S</span>
        <span className="absolute" style={{ left: 381, background: CYAN }}> CPU%▽</span>
        <span className="absolute" style={{ left: 445 }}>MEM%</span>
        <span className="absolute" style={{ left: 491 }}>TIME+</span>
        <span className="absolute" style={{ left: 541 }}>Command</span>
      </div>
      {/* 进程列表（绝对列定位） */}
      {procs.map((p, i) => (
        <div
          key={i}
          className="relative h-[15px] whitespace-pre"
          style={p.hl ? { background: CYAN, color: DARK } : undefined}
        >
          {COLS.map(({ k, right }) => (
            <span
              key={k}
              className="absolute text-right"
              style={{ left: 0, width: right, color: colColor(p, k) }}
            >
              {p[k]}
            </span>
          ))}
          <span className="absolute" style={{ left: 69, color: p.hl ? DARK : colColor(p, "user") }}>
            {p.user}
          </span>
          {p.ipColor ? (
            <span className="absolute" style={{ left: 541 }}>
              <span style={{ color: p.hl ? DARK : BRIGHT }}>
                {p.cmd.slice(0, p.cmd.lastIndexOf(" ") + 1)}
              </span>
              <span style={{ color: p.ipColor }}>{p.cmd.slice(p.cmd.lastIndexOf(" ") + 1)}</span>
            </span>
          ) : (
            <span className="absolute" style={{ left: 541, color: p.hl ? DARK : (p.cmdColor ?? BRIGHT) }}>
              {p.cmd}
            </span>
          )}
        </div>
      ))}
      {/* F 键行（青底黑字，字段绝对定位） */}
      <div className="absolute left-0 right-0" style={{ bottom: 18, height: 15, background: CYAN, color: DARK }}>
        {fkeys.map(([fn, fx, label, lx]) => (
          <span key={fn}>
            <span className="absolute" style={{ left: fx }}>
              {fn}
            </span>
            <span className="absolute" style={{ left: lx, background: BRIGHT, color: DARK }}>
              {label}
            </span>
          </span>
        ))}
      </div>
    </div>
  );
}
