// 左侧会话面板：35px 图标条 + 树（总宽 244px，pixel-spec §4.5）
// 行高 24px，首行顶 y=4（相对内容区，ref 127-123）；图标为 ref 提取 sprite。
// 实测（ref home 截图）：user 图标 x39 / 文件夹 x65 / 钥匙框 x65；
// 文本左缘 L0 67 / L1 93 / L2 93；箭头 x47-52；选中框 x63-116 边 #60cdff 底 #626262；
// 滚动条 x227-228 #909090，轨道 #171717，分隔条 x239 #6a6a6a + x240-243 #323232。
import SideIconBar, { baseSideIcons } from "./SideIconBar";
import userfolder from "../assets/sprites/userfolder.png";
import folder from "../assets/sprites/folder.png";
import keybox from "../assets/sprites/keybox.png";

interface Row {
  label: string;
  level: number;
  kind: "group" | "folder" | "ssh";
  selected?: boolean;
}

const rows: Row[] = [
  { label: "User sessions", level: 0, kind: "group" },
  { label: "SDFE", level: 1, kind: "folder" },
  { label: "Sma132", level: 1, kind: "folder" },
  { label: "Test", level: 1, kind: "folder", selected: true },
  { label: "10.0.0.1 (root)", level: 2, kind: "ssh" },
  { label: "10.0.0.187 (root)", level: 2, kind: "ssh" },
  { label: "10.0.6.30 (root)", level: 2, kind: "ssh" },
  { label: "103.136.127.158 (root)", level: 2, kind: "ssh" },
  { label: "103.197.71.27 (root)", level: 2, kind: "ssh" },
  { label: "103.75.70.101 (root)", level: 2, kind: "ssh" },
  { label: "116.30.198.42 (small32)", level: 2, kind: "ssh" },
  { label: "119.91.103.158 (root)", level: 2, kind: "ssh" },
  { label: "137.220.150.197 (root)", level: 2, kind: "ssh" },
  { label: "146.19.100.245 (root)", level: 2, kind: "ssh" },
  { label: "172.19.19.146 (admin)", level: 2, kind: "ssh" },
  { label: "172.19.19.146 (root)", level: 2, kind: "ssh" },
  { label: "192.168.10.1 (root)", level: 2, kind: "ssh" },
  { label: "192.168.10.122 (root)", level: 2, kind: "ssh" },
  { label: "192.168.10.156 (root)", level: 2, kind: "ssh" },
  { label: "192.168.10.172 (small32)", level: 2, kind: "ssh" },
  { label: "192.168.10.172 (small32)", level: 2, kind: "ssh" },
  { label: "192.168.10.190 (root)", level: 2, kind: "ssh" },
  { label: "192.168.10.190 (root) (1)", level: 2, kind: "ssh" },
  { label: "192.168.10.190 (root) (2)", level: 2, kind: "ssh" },
  { label: "192.168.10.218 (small32)", level: 2, kind: "ssh" },
  { label: "192.168.103.29 (admin)", level: 2, kind: "ssh" },
  { label: "192.168.103.41 (root)", level: 2, kind: "ssh" },
];

// 树容器左缘 = 35（图标条宽），内部坐标 = 绝对坐标 - 35
const TEXT_LEFT = [32, 58, 58];
const TEXT_COLOR = "#d3d3d3";

function RowView({ row, index }: { row: Row; index: number }) {
  const top = 4 + index * 24;
  const icon =
    row.kind === "group" ? userfolder : row.kind === "folder" ? folder : keybox;
  const iconLeft = row.kind === "group" ? 4 : 30;
  return (
    <div className="absolute left-0 right-0 h-[24px]" style={{ top }}>
      {row.level === 1 && (
        <svg className="absolute" style={{ left: 12, top: 6 }} width="6" height="10" viewBox="0 0 6 10">
          <path d="M1 1 L5 5 L1 9" stroke="#d9d9d9" strokeWidth="1.6" fill="none" />
        </svg>
      )}
      {row.selected && (
        <div
          className="absolute"
          style={{
            left: 28,
            top: 0,
            width: 54,
            height: 24,
            border: "1px solid #60cdff",
            background: "#626262",
          }}
        />
      )}
      <img
        src={icon}
        alt=""
        className="absolute"
        style={{ left: iconLeft, top: 3, width: 22, height: 18 }}
      />
      <span
        className="absolute whitespace-nowrap text-[11px]"
        style={{
          left: TEXT_LEFT[row.level],
          top: 5,
          color: row.selected ? "#f9f9f9" : TEXT_COLOR,
          fontFamily: "Tahoma, 'Segoe UI', sans-serif",
        }}
      >
        {row.label}
      </span>
    </div>
  );
}

export default function SessionTree() {
  return (
    <div className="flex h-full w-[244px] shrink-0">
      <SideIconBar items={baseSideIcons} />
      {/* 树内容区 */}
      <div className="relative h-full min-w-0 flex-1" style={{ background: "#141414" }}>
        {rows.map((row, i) => (
          <RowView key={i} row={row} index={i} />
        ))}
        {/* 滚动条：轨道 + 拇指（绝对 x227 - 35） */}
        <div className="absolute bottom-0" style={{ left: 192, top: 0, width: 10, background: "#171717" }} />
        <div className="absolute" style={{ left: 192, top: 21, width: 2, height: 721, background: "#909090" }} />
      </div>
      {/* 分隔条 5px：x239 边线 + x240-243 */}
      <div className="h-full w-[1px] shrink-0" style={{ background: "#6a6a6a" }} />
      <div className="h-full w-[4px] shrink-0" style={{ background: "#323232" }} />
    </div>
  );
}
