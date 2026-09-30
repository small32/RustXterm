// 终端界面布局（截图 2）：左侧 SFTP 面板 244px + 右侧终端区，底部功能键栏 24px。
// 终端区实测范围 x244–1902、y123–1014（pixel-spec §4.7），macOS 版删除右侧滚动条后占满。
import SftpPanel from "./SftpPanel";
import TerminalArea from "./TerminalArea";
import FnBar from "./FnBar";

export default function TerminalLayout() {
  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="flex min-h-0 flex-1">
        <SftpPanel />
        <TerminalArea />
      </div>
      <FnBar />
    </div>
  );
}
