import React from "react";
import tunnel from "@dwelle/tunnel-rat";
declare type Tunnel = ReturnType<typeof tunnel>;
declare type TunnelsContextValue = {
    mainMenuTunnel: Tunnel;
    welcomeScreenMenuHintTunnel: Tunnel;
    welcomeScreenToolbarHintTunnel: Tunnel;
    welcomeScreenHelpHintTunnel: Tunnel;
    welcomeScreenCenterTunnel: Tunnel;
    footerCenterTunnel: Tunnel;
    jotaiScope: symbol;
};
export declare const TunnelsContext: React.Context<TunnelsContextValue>;
export declare const useTunnels: () => TunnelsContextValue;
export declare const useInitializeTunnels: () => TunnelsContextValue;
export {};
