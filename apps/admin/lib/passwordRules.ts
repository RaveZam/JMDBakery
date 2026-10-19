// The strength rules for a new account password, in the order they are checked.
// `label` is shown in the live checklist, `message` when the form is submitted.
export const PASSWORD_RULES: { label: string; message: string; test: RegExp }[] = [
  {
    label: "8 characters minimum",
    message: "Password must be at least 8 characters.",
    test: /.{8,}/,
  },
  {
    label: "One uppercase letter",
    message: "Password needs an uppercase letter.",
    test: /[A-Z]/,
  },
  {
    label: "One lowercase letter",
    message: "Password needs a lowercase letter.",
    test: /[a-z]/,
  },
  {
    label: "One number",
    message: "Password needs a number.",
    test: /[0-9]/,
  },
  {
    label: "One special character, like ! @ # $",
    message: "Password needs a special character.",
    test: /[^A-Za-z0-9\s]/,
  },
];
