import {getBulkKeyed, Filters} from "@webpack";
import Store from "@stores/base";
import Patcher from "@modules/patcher";
import React from "@modules/react";
import {useStateFromStores} from "@ui/hooks";
import Logger from "@common/logger";

export interface ButtonData {
    id: string;
    render: React.ComponentType<any>;
    // tooltip?: string;
    position?: "start" | "end";
}

const ChatButtonStore = new class CBS extends Store {
    buttons = new Map<string, ButtonData>();

    getButtons() {
        return Array.from(this.buttons.values());
    }

    register(callerId: string, data: ButtonData) {
        this.buttons.set(`${callerId}-${data.id}`, data);
        this.emitChange();
    }

    unregister(callerId: string, id: string) {
        this.buttons.delete(`${callerId}-${id}`);
        this.emitChange();
    }

    unregisterAll(callerId: string) {
        for (const key of this.buttons.keys()) {
            if (key.startsWith(`${callerId}-`)) this.buttons.delete(key);
        }
        this.emitChange();
    }
};

function ButtonParent() {
    const buttons = useStateFromStores([ChatButtonStore], () => ChatButtonStore.getButtons());
    return <>{buttons.map(button => <button.render key={button.id} />)}</>;
}

class ChatButtonManager {
    static #patched = false;

    static Module = getBulkKeyed({
        Components: {
            filter: Filters.byKeys(["createToast"]),
            map: {
                InteractiveButton: Filters.byPrototypeKeys(["renderNonInteractive"])
            }
        },
        Patch: {
            filter: Filters.bySource("isSubmitButtonEnabled", ".A.getActiveOption(")
        }
    });

    static initialize() {
        if (this.#patched) return;
        this.#patched = true;

        if (!this.Module?.Patch) {
            Logger.err("ChatButtonManager", "Could not find chat module to patch");
            return;
        }

        Patcher.after("ChatButtonManager", this.Module.Patch.A, "type", (_, __, res) => {
            if (!res?.props?.children) return;
            res.props.children.push(<ButtonParent />);
        });
    }

    static register(caller: string, data: ButtonData) {
        this.initialize();
        ChatButtonStore.register(caller, data);
        return () => this.unregister(caller, data.id);
    }

    static unregister(caller: string, id: string) {
        ChatButtonStore.unregister(caller, id);
    }

    static unregisterAll(caller: string) {
        ChatButtonStore.unregisterAll(caller);
    }
}

export default ChatButtonManager;