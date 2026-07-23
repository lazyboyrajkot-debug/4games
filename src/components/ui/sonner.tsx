import { Toaster as Sonner, type ToasterProps } from "sonner";

function Toaster({ ...props }: ToasterProps) {
  return <Sonner theme="dark" richColors position="top-right" {...props} />;
}

export { Toaster };
