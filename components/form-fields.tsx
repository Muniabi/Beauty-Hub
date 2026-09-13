import { cn } from "@/lib/utils";

export function TextField({
  label,
  name,
  defaultValue,
  required,
  placeholder,
  autoComplete,
}: {
  label: string;
  name: string;
  defaultValue?: string;
  required?: boolean;
  placeholder?: string;
  autoComplete?: string;
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-[13px] leading-[18px] font-medium text-[var(--color-text-muted)]">
        {label}
        {required ? " *" : ""}
      </span>
      <input
        name={name}
        required={required}
        defaultValue={defaultValue}
        placeholder={placeholder}
        autoComplete={autoComplete}
        className={cn(
          "h-12 rounded-[10px] border border-border bg-card px-3 text-[15px] leading-[22px] text-foreground outline-none md:h-11",
          "focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/30",
        )}
      />
    </label>
  );
}

export function SelectField({
  label,
  name,
  defaultValue,
  required,
  placeholder,
  options,
}: {
  label: string;
  name: string;
  defaultValue?: string;
  required?: boolean;
  placeholder: string;
  options: { id: string; name: string }[];
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-[13px] leading-[18px] font-medium text-[var(--color-text-muted)]">
        {label}
        {required ? " *" : ""}
      </span>
      <select
        name={name}
        required={required}
        defaultValue={defaultValue ?? ""}
        className="h-12 rounded-[10px] border border-border bg-card px-3 text-[15px] leading-[22px] text-foreground outline-none md:h-11 focus-visible:border-primary"
      >
        <option value="">{placeholder}</option>
        {options.map((option) => (
          <option key={option.id} value={option.id}>
            {option.name}
          </option>
        ))}
      </select>
    </label>
  );
}
