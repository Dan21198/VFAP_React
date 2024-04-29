export interface SnackbarProps {
    show: boolean;
    message: string;
    onClose: () => void;
    variant: string;
}
