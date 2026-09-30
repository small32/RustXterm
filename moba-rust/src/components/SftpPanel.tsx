// SFTP 面板（终端界面左侧，宽 244px，pixel-spec §4.9，实测修正）
// 结构：35px 图标条 + 右侧（顶部横向工具栏 24px + 路径框 + 名称表头 + 文件列表）+ 4px 分隔条。
// 内容读自截图：/home/small32/ + .. / .Xauthority / .profile / .bashrc / .bash_logout / .bash_history。
import {
  FolderOpen,
  Download,
  Upload,
  RefreshCw,
  Folder,
  File,
  X,
  Type,
  ChevronDown,
  Triangle,
} from "lucide-react";
import SideIconBar, { sftpSideIcons } from "./SideIconBar";

const toolbarIcons = [
  { icon: FolderOpen, color: "#f5bc12" },
  { icon: Download, color: "#1476ba" },
  { icon: Upload, color: "#00bbd5" },
  { icon: RefreshCw, color: "#49ae4e" },
  { icon: Folder, color: "#f5bc12" },
  { icon: File, color: "#93ccf9" },
  { icon: X, color: "#f34134" },
  { icon: Type, color: "#8fc8f7" },
];

const files = [
  { name: "..", dir: true, up: true },
  { name: ".Xauthority", dir: false },
  { name: ".profile", dir: false },
  { name: ".bashrc", dir: false },
  { name: ".bash_logout", dir: false },
  { name: ".bash_history", dir: false },
];

export default function SftpPanel() {
  return (
    <div className="flex h-full w-[244px] shrink-0">
      <SideIconBar items={sftpSideIcons} />
      <div
        className="flex h-full min-w-0 flex-1 flex-col"
        style={{ background: "var(--bg-chrome)" }}
      >
        {/* 顶部横向工具栏 24px */}
        <div className="flex h-[24px] shrink-0 items-center gap-[9px] pl-[5px]">
          {toolbarIcons.map((it, i) => {
            const Icon = it.icon;
            return <Icon key={i} size={14} style={{ color: it.color }} />;
          })}
        </div>
        {/* 路径框 */}
        <div className="flex h-[22px] shrink-0 items-center px-[2px]">
          <div
            className="flex h-[20px] flex-1 items-center justify-between px-[4px]"
            style={{ background: "var(--fill-button)" }}
          >
            <span className="text-[12px]" style={{ color: "var(--text-main)" }}>
              /home/small32/
            </span>
            <ChevronDown size={12} style={{ color: "var(--text-main)" }} />
          </div>
        </div>
        {/* 名称表头 20px */}
        <div
          className="flex h-[20px] shrink-0 items-center gap-[6px] px-[4px]"
          style={{ background: "var(--fill-button)" }}
        >
          <Triangle size={10} style={{ color: "#4b84b0" }} fill="#4b84b0" />
          <span className="text-[12px]" style={{ color: "#8fc8f7" }}>
            名称
          </span>
        </div>
        {/* 文件列表 */}
        <div className="min-h-0 flex-1 overflow-y-auto">
          {files.map((f) => (
            <div key={f.name} className="flex h-[24px] items-center px-[8px]">
              {f.dir ? (
                <Folder
                  size={14}
                  style={{ color: f.up ? "#49ae4e" : "#9aaecd" }}
                  fill={f.up ? "#49ae4e" : "#9aaecd"}
                />
              ) : (
                <File size={14} style={{ color: "#8c8c8c" }} />
              )}
              <span className="ml-[6px] text-[12px]" style={{ color: "var(--text-main)" }}>
                {f.name}
              </span>
            </div>
          ))}
        </div>
      </div>
      {/* 分隔条 4px */}
      <div className="h-full w-[4px] shrink-0" style={{ background: "var(--fill-button)" }} />
    </div>
  );
}
