import WebpackModules from "@modules/webpackmodules";
import Patcher from "@modules/patcher";
import Utils from "@api/utils";
import CustomCSS from "@builtins/customcss";
import React from "@modules/react";
import UI from "@api/ui";
import Settings from "@modules/settingsmanager";
import Strings from "@modules/strings";
import {PackageOpenIcon} from "lucide-react";
import Logger from "@api/logger.js";
import NotificationUI from "@modules/notification.jsx";

class InstallCSS {
    static activeNotifications = new Map();

    static initialize() {
        const patch = WebpackModules.getModule(m => m.defaultRules && m.parse).defaultRules.codeBlock;
        Patcher.after("InstallCSS", patch, "react", (_, [args], child) => {
            const isEnabled = Settings.get("customcss", "customcss");
            if (!isEnabled) return;

            const content = args.content;
            if (!content) return;

            if (child?.type !== "pre") return;
            if (args?.lang !== "css") return;

            const codeActions = Utils.findInTree(child, x => x?.className?.includes("codeActions"), {walkable: ["props", "children"]});
            if (!codeActions) return;

            if (!args?.content) return;

            const existingCodeblocks = Array.isArray(codeActions.children) ? codeActions.children : [codeActions.children];
            codeActions.children = [
                ...existingCodeblocks,
                <PackageOpenIcon
                    style={{cursor: "pointer"}}
                    size="16px"
                    key="icon"
                    onClick={async (event) => {
                        if (event.shiftKey) {
                            this.handleCSSInstall(args?.content);
                            return;
                        }

                        UI.showConfirmationModal(
                            Strings.Modals.confirmAction,
                            Strings.Modals.installCss,
                            {
                                confirmText: Strings.Modals.okay,
                                cancelText: Strings.Modals.cancel,
                                onConfirm: () => this.handleCSSInstall(args?.content)
                            }
                        );
                    }}
                />
            ];
        });
    }

    static handleCSSInstall(cssBlock) {
        try {
            const currentCSS = CustomCSS.savedCss || "";
            const newCSS = currentCSS + "\n" + cssBlock;

            CustomCSS.saveCSS(newCSS);
            CustomCSS.insertCSS(newCSS);
            UI.showToast(Strings.CustomCSS.cssInstallSuccess, {type: "success"});

            const notificationId = `css-undo-${Date.now()}`;

            this.activeNotifications.set(notificationId, cssBlock);

            NotificationUI.show({
                id: notificationId,
                title: Strings.CustomCSS.cssInstalled,
                content: Strings.CustomCSS.cssReverting,
                type: "warning",
                duration: 10000,
                actions: [{
                    label: "Keep",
                    onClick: () => this.keepChanges(notificationId)
                }],
                onDurationDone: () => this.revertCSS(notificationId)
            });
        }
        catch (error) {
            Logger.log("InstallCSS", "Failed to install CSS:", error);
            UI.showToast(Strings.CustomCSS.cssInstallError, {type: "error"});
        }
    }

    static keepChanges(notificationId) {
        this.activeNotifications.delete(notificationId);
        UI.showToast(Strings.CustomCSS.cssKept, {type: "success"});
    }

    static revertCSS(notificationId) {
        const cssBlock = this.activeNotifications.get(notificationId);
        if (!cssBlock) return;

        const currentCSS = CustomCSS.savedCss || "";
        const newCSS = currentCSS.replace(cssBlock, "").replace(/\n\n+/g, "\n").trim();

        CustomCSS.saveCSS(newCSS);
        CustomCSS.insertCSS(newCSS);
        this.activeNotifications.delete(notificationId);
        UI.showToast(Strings.CustomCSS.cssReverted, {type: "error"});
    }
}

export default InstallCSS;