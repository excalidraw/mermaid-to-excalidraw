declare const MenuTrigger: {
    ({ className, children, onToggle, }: {
        className?: string | undefined;
        children: React.ReactNode;
        onToggle: () => void;
    }): JSX.Element;
    displayName: string;
};
export default MenuTrigger;
