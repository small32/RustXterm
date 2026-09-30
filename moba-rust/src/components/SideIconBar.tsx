// 左侧 35px 图标条（会话树与 SFTP 面板共用）
// 图标为 ref 截图提取的 sprite（src/assets/sprites/），按 ref 实测 y 定位：
// 星 y13 / 军刀 y58 / 纸飞机 y99；sftp 另加橙圆 y151。
import star from "../assets/sprites/star.png";
import knife from "../assets/sprites/knife.png";
import plane from "../assets/sprites/plane.png";
import circle from "../assets/sprites/circle.png";

export interface SideIcon {
  src: string;
  top: number;
  left: number;
  w: number;
  h: number;
}

export const baseSideIcons: SideIcon[] = [
  { src: star, top: 1, left: 0, w: 35, h: 43 },
  { src: knife, top: 46, left: 0, w: 35, h: 39 },
  { src: plane, top: 87, left: 0, w: 35, h: 38 },
];

export const sftpSideIcons: SideIcon[] = [
  ...baseSideIcons,
  { src: circle, top: 139, left: 8, w: 20, h: 20 },
];

export default function SideIconBar({ items }: { items: SideIcon[] }) {
  return (
    <div className="relative h-full w-[35px] shrink-0" style={{ background: "#141414" }}>
      {items.map((it, i) => (
        <img
          key={i}
          src={it.src}
          alt=""
          className="absolute"
          style={{ top: it.top, left: it.left, width: it.w, height: it.h }}
        />
      ))}
    </div>
  );
}
