import ChatButtonManager, {type ButtonData} from "@builtins/apis/chatbuttonsmanager.tsx";

type RegisterArgs<Bounded extends boolean> = [
    ...(Bounded extends false ? [caller: string] : []),
    data: ButtonData
];

type UnregisterArgs<Bounded extends boolean> = [
    ...(Bounded extends false ? [caller: string] : []),
    id: string
];

class ChatButtons<Bounded extends boolean> {
    #callerName = "";

    constructor(callerName?: string) {
        if (!callerName) return;
        this.#callerName = callerName;
    }

    register(...args: RegisterArgs<Bounded>) {
        const caller = (this.#callerName || args[0]) as string;
        const data = args[this.#callerName ? 0 : 1] as ButtonData;
        return ChatButtonManager.register(caller, data);
    }

    unregister(...args: UnregisterArgs<Bounded>) {
        const caller = (this.#callerName || args[0]) as string;
        const id = args[this.#callerName ? 0 : 1] as string;
        ChatButtonManager.unregister(caller, id);
    }

    unregisterAll(caller?: string) {
        ChatButtonManager.unregisterAll((caller || this.#callerName)!);
    }
}

Object.freeze(ChatButtons);
Object.freeze(ChatButtons.prototype);
export default ChatButtons;