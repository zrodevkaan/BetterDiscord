import ToolbarUI from "@stores/toolbar";
import ChatbarUI from "@stores/buttons";

export class APIs {
    private callerId: string | undefined;
    Toolbar: ToolbarUI;
    Chatbar: ChatbarUI;
    static Toolbar = new ToolbarUI(undefined);
    static Chatbar = new ChatbarUI(undefined);
    constructor(caller: string | undefined) {
        this.callerId = caller;
        this.Toolbar = new ToolbarUI(this.callerId);
        this.Chatbar = new ChatbarUI(this.callerId);
    }
}