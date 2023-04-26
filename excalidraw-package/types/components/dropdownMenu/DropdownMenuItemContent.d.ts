declare const MenuItemContent: ({ icon, shortcut, children, }: {
    icon?: JSX.Element | undefined;
    shortcut?: string | undefined;
    children: React.ReactNode;
}) => JSX.Element;
export default MenuItemContent;
