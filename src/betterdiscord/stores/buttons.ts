import Store from "./base";

export class ChatbarStore extends Store {
    buttons = new Map<string, Set<object>>();

    register(callerId: string, data: object): () => void {
        if (!this.buttons.has(callerId)) this.buttons.set(callerId, new Set());
        this.buttons.get(callerId)!.add(data);
        this.emit();
        return () => this.unregister(data);
    }

    unregister(data: object): void {
        for (const [callerId, items] of this.buttons) {
            if (items.delete(data)) {
                if (items.size === 0) this.buttons.delete(callerId);
                this.emit();
                break;
            }
        }
    }

    unregisterAll(callerId: string): void {
        if (this.buttons.delete(callerId)) this.emit();
    }

    getAllButtons(): object[] {
        const allButtons: object[] = [];
        for (const items of this.buttons.values()) {
            allButtons.push(...Array.from(items));
        }
        return allButtons;
    }
}

export const store = new ChatbarStore();

export class ChatbarAPI {
    private callerId: string | undefined;

    constructor(caller: string | undefined) {
        this.callerId = caller;
    }

    register(callerIdOrData: string | object, data?: object): () => void {
        const id = typeof callerIdOrData === "string" ? callerIdOrData : this.callerId;
        if (!id) throw new Error("No callerId");
        return store.register(id, typeof callerIdOrData === "string" ? data || {} : callerIdOrData);
    }

    unregister(data: object): void {
        store.unregister(data);
    }

    unregisterAll(callerId?: string): void {
        const id = callerId || this.callerId;
        if (id) store.unregisterAll(id);
    }
}

export default ChatbarAPI;