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

export function PreferenceToggle({
  name,
  label,
  defaultChecked = false,
}: {
  name: string;
  label: string;
  defaultChecked?: boolean;
}) {
  return (
    <label className="relative flex h-14 items-center justify-between rounded-[10px] border border-border bg-card px-4">
      <span className="text-[15px] leading-[22px]">{label}</span>
      <input
        type="checkbox"
        name={name}
        defaultChecked={defaultChecked}
        className="peer sr-only"
      />
      <span className="relative h-7 w-12 shrink-0 rounded-[10px] border border-border bg-card transition peer-checked:border-primary peer-checked:bg-primary peer-focus-visible:ring-2 peer-focus-visible:ring-primary/40">
        <span className="absolute top-0.5 left-0.5 size-6 rounded-[8px] bg-[var(--color-surface-muted)] transition peer-checked:translate-x-5 peer-checked:bg-[var(--color-accent-text)]" />
      </span>
    </label>
  );
}
