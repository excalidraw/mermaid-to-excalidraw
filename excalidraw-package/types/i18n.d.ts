export interface Language {
    code: string;
    label: string;
    rtl?: boolean;
}
export declare const defaultLang: {
    code: string;
    label: string;
};
export declare const languages: Language[];
export declare const setLanguage: (lang: Language) => Promise<void>;
export declare const getLanguage: () => Language;
export declare const t: (path: string, replacement?: {
    [key: string]: string | number;
} | undefined) => string;
export declare const useI18n: () => {
    t: (path: string, replacement?: {
        [key: string]: string | number;
    } | undefined) => string;
    langCode: string;
};
