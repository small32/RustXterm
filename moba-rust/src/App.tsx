// Phase 0 占位：仅验证 Tauri 窗口 + Tailwind 生效，无任何界面逻辑。
// 颜色取 pixel-spec.md 实测值（深色套）。
export default function App() {
  return (
    <div className="flex h-screen w-screen items-center justify-center bg-[#202020] font-sans text-[#d9d9d9]">
      <span className="text-[13px] tracking-wide">MobaRust</span>
    </div>
  );
}