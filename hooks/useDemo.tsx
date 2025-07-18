export interface DemoOption {
  label: string;
  value: string;
}

export default function useDemo() {
  const options: DemoOption[] = [
    { label: "GENERAL", value: "general" },
    { label: "BYD", value: "byd" },
    { label: "CELCOMDIGI", value: "celcomdigi" },
  ];

  return { options };
}
