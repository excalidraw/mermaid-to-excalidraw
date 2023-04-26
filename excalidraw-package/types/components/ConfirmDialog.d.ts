import { DialogProps } from "./Dialog";
import "./ConfirmDialog.scss";
interface Props extends Omit<DialogProps, "onCloseRequest"> {
    onConfirm: () => void;
    onCancel: () => void;
    confirmText?: string;
    cancelText?: string;
}
declare const ConfirmDialog: (props: Props) => JSX.Element;
export default ConfirmDialog;
