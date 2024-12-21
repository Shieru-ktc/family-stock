import { FormControl, FormItem, FormLabel, FormMessage } from "./ui/form";

interface FormComponentProps {
  label: string;
  children: React.ReactNode;
}

export default function FormComponent({ label, children }: FormComponentProps) {
  return (
    <FormItem>
      <FormLabel>{label}</FormLabel>
      <FormControl>{children}</FormControl>
      <FormMessage />
    </FormItem>
  );
}
