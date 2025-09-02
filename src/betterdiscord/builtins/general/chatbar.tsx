import Builtin from "@structs/builtin";
import {getModule} from "@webpack";
import {findInTree} from "@common/utils";
import React from "@modules/react";
import {useInternalStore} from "@ui/hooks";
import {shallowEqual} from "fast-equals";
import {store} from "@stores/buttons";

const ChatButtons = getModule(x => x.type?.toString?.().includes("showAllButtons"), {raw: true}).exports;
const ChatButtonComp = getModule(x => x.type?.toString().includes("CHAT_INPUT_BUTTON_NOTIFICATION"));

const BDButtons = () => {
    const buttons = useInternalStore([store], () => store.getAllButtons(), [], shallowEqual);
    return buttons.map((button, index) => (
        <ChatButtonComp
            key={index}
            {...button}
        />
    ));
};

export default new class ChatbarAPI extends Builtin {
    get name() {
        return "Chatbar";
    }
    get category() {
        return "general";
    }
    get id() {
        return "chatBar";
    }

    async enabled() {
        this.after(ChatButtons.Z, "type", (_, __, ret) => {
            const buttons = findInTree(ret, x => Array.isArray(x?.children), {
                walkable: ["props", "children"]
            });
            if (buttons?.children) {
                buttons.children.push(<BDButtons />);
            }
        });
    }

    async disabled() {
        this.unpatchAll();
    }
};