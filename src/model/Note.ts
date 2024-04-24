export interface Note {
    id: number | null;
    title: string;
    content: string;
    finished: boolean;
    finishTime: string;
    tags?: Tag[];
}
