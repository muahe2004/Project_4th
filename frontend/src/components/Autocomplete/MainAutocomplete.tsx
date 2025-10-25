import { Autocomplete, TextField } from "@mui/material";

interface MainAutocompleteProps<T> {
  options: T[];
  value?: string; 
  onChange?: (id: string) => void;
  onSearchChange?: (search: string) => void;
  onResetPage?: () => void;
  getOptionLabel?: (option: T) => string;
  getOptionId?: (option: T) => string;
  placeholder?: string;
}

function MainAutocomplete<T>({
  options,
  value,
  onChange,
  onSearchChange,
  onResetPage,
  getOptionLabel = (option: any) => (option.name ? option.name : ""),
  getOptionId = (option: any) => (option.id ? option.id.toString() : ""),
  placeholder = "Chọn...",
}: MainAutocompleteProps<T>) {
    return (
        <Autocomplete<T, false, false, true>
            className="main-auto-complete filter-text__field"
            freeSolo
            options={options}
            getOptionLabel={(option) =>
                typeof option === "string" ? option : getOptionLabel(option)
            }
            isOptionEqualToValue={(option, val) => getOptionId(option) === (val as any)?.id}
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
                />
            )}
        />
    );
}

export default MainAutocomplete;