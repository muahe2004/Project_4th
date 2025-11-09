import { Autocomplete, TextField } from "@mui/material";
import clsx from "clsx";

interface MainAutocompleteProps<T> {
    options: T[];
    value?: string | T | null;
    onChange?: (id: string) => void;
    onSearchChange?: (search: string) => void;
    onResetPage?: () => void;
    getOptionLabel?: (option: T) => string;
    getOptionId?: (option: T) => string;
    placeholder?: string;
    className?: string;
    error?: boolean;
    helperText?: string;
}

function MainAutocomplete<T>({
    options = [],
    value,
    onChange,
    onSearchChange,
    onResetPage,
    getOptionLabel = (option: any) => option?.name ?? "",
    getOptionId = (option: any) => option?.id?.toString() ?? "",
    placeholder,
    className,
    error = false,
    helperText = "",
}: MainAutocompleteProps<T>) {
    const currentValue =
        typeof value === "object" && value !== null
            ? value
            : options.find((opt) => getOptionId(opt) === value) || null;

    return (
        <Autocomplete<T, false, false, true>
            className={clsx("main-auto-complete", className)}
            freeSolo
            options={options}
            value={currentValue as any}
            getOptionLabel={(option) =>
                typeof option === "string" ? option : getOptionLabel(option)
            }
            isOptionEqualToValue={(option, val) =>
                getOptionId(option) === (val && getOptionId(val as any))
            }
            onChange={(_, newValue) => {
                let id = "";
                if (newValue && typeof newValue !== "string") {
                    id = getOptionId(newValue);
                }
                onChange?.(id);
                onResetPage?.();
            }}
            onInputChange={(_, inputValue, reason) => {
                if (reason === "clear") {
                    onChange?.("");
                    onResetPage?.();
                }
                onSearchChange?.(inputValue);
            }}
            renderInput={(params) => (
                <TextField
                    {...params}
                    placeholder={placeholder}
                    variant="outlined"
                    className="main-text__field filter-text__field"
                    error={error}
                    helperText={helperText}
                    onFocus={() => {
                        onSearchChange?.("");
                        onResetPage?.();
                    }}
                />
            )}
        />
    );
}

export default MainAutocomplete;