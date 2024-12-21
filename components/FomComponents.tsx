import { FormItem, FormLabel, FormMessage } from "./ui/form";

interface FormComponentProps {
  label: string;
  children: React.ReactNode;
}

export default function FormComponent({ label, children }: FormComponentProps) {
  return (
    <FormItem>
      <FormLabel>{label}</FormLabel>
      {children}
      <FormMessage />
    </FormItem>
  );
}
