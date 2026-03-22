import * as React from "react";
import TextField from "@mui/material/TextField";
import InputAdornment from "@mui/material/InputAdornment";
import IconButton from "@mui/material/IconButton";
import SearchIcon from "@mui/icons-material/Search";
import ClearIcon from "@mui/icons-material/Clear";

import "./SearchEngine.css";

const searchDraftCache = new Map<string, string>();

export type SearchEngineProps = {
    placeholder?: string;
    onSearch: (value: string) => void; 
};

export default function SearchEngine({ placeholder = "Tìm kiếm...", onSearch }: SearchEngineProps) {
    const cacheKey = React.useMemo(() => {
        if (typeof window === "undefined") {
            return placeholder;
        }
        return `${window.location.pathname}::${placeholder}`;
    }, [placeholder]);

    const [value, setValue] = React.useState(() => searchDraftCache.get(cacheKey) ?? "");

    React.useEffect(() => {
        setValue(searchDraftCache.get(cacheKey) ?? "");
    }, [cacheKey]);

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = event.target.value;
        setValue(newValue);
        searchDraftCache.set(cacheKey, newValue);
    };

    const handleClear = () => {
        setValue("");
        searchDraftCache.delete(cacheKey);
        onSearch(""); 
    };

    const handleSearch = () => {
        const normalizedValue = value.trim();
        searchDraftCache.set(cacheKey, normalizedValue);
        onSearch(normalizedValue);
    };

    const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (event.key === "Enter") {
            event.preventDefault();
            event.stopPropagation();
            handleSearch();
        }
    };

    return (
        <TextField
            variant="outlined"
            placeholder={placeholder}
            value={value}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            className="main-text__field search-engine__input"
            InputProps={{
                endAdornment: (
                <InputAdornment position="end">
                    {value && (
                        <IconButton onClick={handleClear} className="search-engine__icon" size="small">
                            <ClearIcon fontSize="small" />
                        </IconButton>
                    )}
                    <IconButton onClick={handleSearch} size="small" className="search-engine__icon">
                        <SearchIcon />
                    </IconButton>
                </InputAdornment>
                ),
            }}
        />
    );
}
