export type CheckGroup = "auth" | "data" | "schema" | "export" | "ui" | "speed";

export type CheckStatus = "pass" | "fail" | "running";

export type LocalizedText = {
  en: string;
  es: string;
};

export type VisualCheck = {
  id: string;
  group: CheckGroup;
  status: Exclude<CheckStatus, "running">;
  detail: LocalizedText;
};

export type TestLocale = "en" | "es";
