import { NonDeletedExcalidrawElement } from "./element/types";
export declare type ChartElements = readonly NonDeletedExcalidrawElement[];
export interface Spreadsheet {
    title: string | null;
    labels: string[] | null;
    values: number[];
}
export declare const NOT_SPREADSHEET = "NOT_SPREADSHEET";
export declare const VALID_SPREADSHEET = "VALID_SPREADSHEET";
declare type ParseSpreadsheetResult = {
    type: typeof NOT_SPREADSHEET;
    reason: string;
} | {
    type: typeof VALID_SPREADSHEET;
    spreadsheet: Spreadsheet;
};
/**
 * @private exported for testing
 */
export declare const tryParseNumber: (s: string) => number | null;
/**
 * @private exported for testing
 */
export declare const tryParseCells: (cells: string[][]) => ParseSpreadsheetResult;
export declare const tryParseSpreadsheet: (text: string) => ParseSpreadsheetResult;
export declare const renderSpreadsheet: (chartType: string, spreadsheet: Spreadsheet, x: number, y: number) => ChartElements;
export {};
