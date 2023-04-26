import "./UserList.scss";
import React from "react";
import { AppState } from "../types";
export declare const UserList: React.FC<{
    className?: string;
    mobile?: boolean;
    collaborators: AppState["collaborators"];
}>;
