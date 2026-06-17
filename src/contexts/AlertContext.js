import { createContext, useContext, useState, useCallback } from "react";
import { AppModal } from "../components/common/AppModal";

const Ctx = createContext(null);

export function AlertProvider({ children }) {
  const [state, setState] = useState({ visible: false, title: "", message: "", actions: [], icon: null, iconColor: null });

  const showAlert = useCallback((title, message, actions, opts) => {
    if (typeof title === "object") {
      setState({ visible: true, ...title });
      return;
    }
    const mapped = (actions || []).map((a) => ({
      label: a.text || a.label,
      style: a.style,
      onPress: a.onPress,
      icon: a.icon,
      color: a.color,
    }));
    setState({
      visible: true,
      title: title || "",
      message: message || "",
      actions: mapped.length > 0 ? mapped : [{ label: "Tamam" }],
      icon: opts?.icon || null,
      iconColor: opts?.iconColor || null,
    });
  }, []);

  const hide = useCallback(() => setState((s) => ({ ...s, visible: false })), []);

  return (
    <Ctx.Provider value={showAlert}>
      {children}
      <AppModal
        visible={state.visible}
        onClose={hide}
        title={state.title}
        message={state.message}
        actions={state.actions}
        icon={state.icon}
        iconColor={state.iconColor}
      />
    </Ctx.Provider>
  );
}

export function useAlert() {
  return useContext(Ctx);
}
