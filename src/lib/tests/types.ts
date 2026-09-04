export type CheckGroup = "auth" | "data" | "schema" | "export" | "ui";

export type CheckStatus = "pass" | "fail" | "running";

export type VisualCheck = {
  id: string;
  group: CheckGroup;
  status: Exclude<CheckStatus, "running">;
  detail: string;
};

export type TestLocale = "en" | "es";
