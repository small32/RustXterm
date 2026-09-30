// 底部状态栏：24px 高，整条为 ref 截图 sprite（含复选框/各指标/红叉，像素级一致）。
import statusbar from "../assets/sprites/statusbar.png";

export default function FnBar() {
  return (
    <div className="h-[24px] shrink-0" style={{ background: "#1a1a1a" }}>
      <img src={statusbar} alt="" style={{ width: 1920, height: 24, display: "block" }} />
    </div>
  );
}
