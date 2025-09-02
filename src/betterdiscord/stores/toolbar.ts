import Store from "./base";

class ToolbarStore extends Store {
    menus = new Map<string, Set<object>>();

    register(callerId: string, data: object): () => void {
        if (!this.menus.has(callerId)) this.menus.set(callerId, new Set());
        this.menus.get(callerId)!.add(data);
        this.emit();
        return () => this.unregister(data);
    }

    unregister(data: object): void {
        for (const [callerId, items] of this.menus) {
            if (items.delete(data)) {
                if (items.size === 0) this.menus.delete(callerId);
                this.emit();
                break;
            }
        }
    }

    unregisterAll(callerId: string): void {
        if (this.menus.delete(callerId)) this.emit();
    }
}

export const store = new ToolbarStore();

export class ToolbarAPI {
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

export default ToolbarAPI;