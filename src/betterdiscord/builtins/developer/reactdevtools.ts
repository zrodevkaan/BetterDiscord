import Builtin from "@structs/builtin";

import {t} from "@common/i18n";
import IPC from "@modules/ipc";

import Modals from "@ui/modals";


export default new class ReactDevTools extends Builtin {
    get name() {return "ReactDevTools";}
    get category() {return "developer";}
    get id() {return "reactDevTools";}

    async enabled() {
        this.showModal();
    }

    async disabled() {
        this.showModal();
    }

    type() {
        let originalType = window.$type?.__originalFunction || window.$type;

        Object.defineProperty(window, "$type", {
            get: () => {
                return originalType;
            },
            set: (v) => {
                originalType = v?.__originalFunction || v;
            },
        });
    }

    r() {
        let r = window.$r;

        Object.defineProperty(window, "$r", {
            get: () => {
                if (!r) return;
                return {
                    ...r,
                    type: r.type?.__originalFunction || r.type
                };
            },
            set: (v) => {
                r = v;
            },
        });
    }

    async initialize() {
        super.initialize();

        this.type();
        this.r();
    }

    showModal() {
        if (!this.initialized) return;
        Modals.showConfirmationModal(t("Modals.additionalInfo"), t("Modals.restartPrompt"), {
            confirmText: t("Modals.restartNow"),
            cancelText: t("Modals.restartLater"),
            danger: true,
            onConfirm: () => IPC.relaunch()
        });
    }
};