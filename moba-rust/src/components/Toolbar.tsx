// 工具栏：图标行 32px + 文字行 27px（pixel-spec §4.3 / §8）
// 11 键，键距 56px，首键中心 x≈29.5；右侧两键 x1825/x1881。
// 文字内容读自截图：会话/服务器/工具/我的会话/视图/分屏/多重执行/隧道/包/设置/帮助 + X 服务器/退出。
// 图标为单色近似（原图为彩色位标，形状无法完全一致）。
import {
  Monitor,
  GitFork,
  PocketKnife,
  Star,
  UserSquare,
  Columns,
  Waypoints,
  ArrowLeftRight,
  Archive,
  Settings,
  HelpCircle,
  X,
  Power,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface ToolItem {
  icon: LucideIcon;
  label: string;
  color: string;
}

const mainItems: ToolItem[] = [
  { icon: Monitor, label: "会话", color: "#9aaecd" },
  { icon: GitFork, label: "服务器", color: "#4b84b0" },
  { icon: PocketKnife, label: "工具", color: "#f34134" },
  { icon: Star, label: "我的会话", color: "#f1c100" },
  { icon: UserSquare, label: "视图", color: "#9aaecd" },
  { icon: Columns, label: "分屏", color: "#badefa" },
  { icon: Waypoints, label: "多重执行", color: "#576e81" },
  { icon: ArrowLeftRight, label: "隧道", color: "#49ae4e" },
  { icon: Archive, label: "包", color: "#93ccf9" },
  { icon: Settings, label: "设置", color: "#4b84b0" },
  { icon: HelpCircle, label: "帮助", color: "#1d94f3" },
];

const rightItems: ToolItem[] = [
  { icon: X, label: "X 服务器", color: "#d9d9d9" },
  { icon: Power, label: "退出", color: "#f34134" },
];

export default function Toolbar() {
  return (
    <div className="shrink-0" style={{ background: "var(--bg-chrome)" }}>
      {/* 图标行 32px */}
      <div className="flex h-[32px] items-center pl-[1.5px]">
        {mainItems.map((item) => {
          const Icon = item.icon;
          return (
            <div key={item.label} className="flex w-[56px] shrink-0 justify-center">
              <Icon size={22} style={{ color: item.color }} />
            </div>
          );
        })}
        <div className="flex-1" />
        <div className="mr-[18px] flex items-center gap-[34px]">
          {rightItems.map((item) => {
            const Icon = item.icon;
            return <Icon key={item.label} size={22} style={{ color: item.color }} />;
          })}
        </div>
      </div>
      {/* 文字行 27px */}
      <div className="flex h-[27px] pl-[1.5px]">
        {mainItems.map((item) => (
          <div
            key={item.label}
            className="w-[56px] shrink-0 text-center text-[12px] leading-[27px]"
            style={{ color: "var(--text-toolbar-label)" }}
          >
            {item.label}
          </div>
        ))}
        <div className="flex-1" />
        <div className="mr-[7px] flex items-center">
          <div
            className="w-[56px] text-center text-[12px] leading-[27px]"
            style={{ color: "var(--text-toolbar-label)" }}
          >
            X 服务器
          </div>
          <div
            className="w-[30px] text-center text-[12px] leading-[27px]"
            style={{ color: "var(--text-toolbar-label)" }}
          >
            退出
          </div>
        </div>
      </div>
    </div>
  );
}
