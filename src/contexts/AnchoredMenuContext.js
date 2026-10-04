import { createContext, useCallback, useContext, useState } from "react";
import { AnchoredMenu } from "../components/common/AnchoredMenu";

const Ctx = createContext(null);

// Uygulama kokunde tek menu: ekranlar open({ anchor, title, items }) cagirir.
export function AnchoredMenuProvider({ children }) {
  const [menu, setMenu] = useState({ visible: false, anchor: null, title: "", items: [] });
  const open = useCallback((next) => setMenu({ visible: true, ...next }), []);
  const close = useCallback(() => setMenu((m) => ({ ...m, visible: false })), []);
  return (
    <Ctx.Provider value={open}>
      {children}
      <AnchoredMenu visible={menu.visible} anchor={menu.anchor} title={menu.title} items={menu.items} onClose={close} />
    </Ctx.Provider>
  );
}

export function useAnchoredMenu() {
  return useContext(Ctx);
}

// Basma olayindan menunun acilacagi nokta.
export function anchorOf(event) {
  const n = event?.nativeEvent;
  return n && Number.isFinite(n.pageX) ? { x: n.pageX, y: n.pageY } : null;
}
