import Builtin from "@structs/builtin";
import {getModule} from "@webpack";
import {findInTree} from "@common/utils";
import React from "@modules/react";
import {Logo} from "@ui/logo";
import {store} from "@stores/toolbar";
import ContextMenu from "@api/contextmenu";
import {useInternalStore} from "@ui/hooks";
import {shallowEqual} from "fast-equals";
import ErrorBoundary from "@ui/errorboundary";

const Toolbar = getModule(x => x.Icon && !x.Body, {raw: true}).exports;

const BDComp = () => {
    const toolbarItems = useInternalStore(store, () => {
        const allMenus: object[] = [];
        for (const items of store.menus.values()) {
            allMenus.push(...Array.from(items));
        }
        return allMenus;
    }, [], shallowEqual);

    return <Toolbar.ZP.Icon
        tooltip="BetterDiscord"
        onClick={(e) => {
            const menuItems = toolbarItems.map(item => ({
                label: item.label || "Menu Item",
                action: item.action || (() => {}),
                ...item
            }));
            ContextMenu.prototype.open(e, ContextMenu.prototype.buildMenu(menuItems));
        }}
        icon={() => <Logo
            width="20px"
            height="20px"
            color="var(--icon-tertiary)"
            secondaryColor="var(--icon-tertiary)"
        />}
    />;
};

export default new class ToolbarAPI extends Builtin {
    get name() {
        return "Toolbar";
    }
    get category() {
        return "general";
    }
    get id() {
        return "toolBar";
    }

    async enabled() {
        this.after(Toolbar, "ZP", (_, __, ret) => {
            const items = findInTree(ret, x => x?.className?.includes("toolbar"), {
                walkable: ["props", "children"]
            });
            if (items?.children?.props?.children) {
                const pushInto = items.children.props.children;
                if (pushInto[0]?.unshift) {
                    pushInto[0].unshift(<ErrorBoundary>
                        <BDComp />
                    </ErrorBoundary>);
                }
            }
        });
    }

    async disabled() {
        this.unpatchAll();
    }
};