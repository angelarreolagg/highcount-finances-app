import { useUiStore } from "../../../state/uiStore";
import { ActionButton } from "./ActionButton";
import { LayersIcon, PlusIcon } from "./icons";

/** Floating bottom-center dock with the everyday actions, visible on every route. */
export function ActionDock() {
  const openModal = useUiStore((s) => s.openModal);

  return (
    <div className="fixed bottom-5 left-1/2 z-40 -translate-x-1/2">
      <div className="flex items-start gap-7 rounded-full border border-white/10 bg-panel/80 px-6 py-3 shadow-xl shadow-black/40 backdrop-blur-2xl">
        <ActionButton label="Add" onClick={() => openModal("addTransaction")}>
          <PlusIcon />
        </ActionButton>
        <ActionButton label="MSI" onClick={() => openModal("registerMsi")}>
          <LayersIcon />
        </ActionButton>
      </div>
    </div>
  );
}
