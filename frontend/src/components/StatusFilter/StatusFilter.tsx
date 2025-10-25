import React from "react";
import {
    Select,
    MenuItem,
    IconButton,
    InputAdornment,
    OutlinedInput,
    FormControl,
} from "@mui/material";
import ClearIcon from "@mui/icons-material/Clear";

interface ClearableSelectProps {
    label?: string;
    value: string;
    onChange: (value: string) => void;
    options: { value: string; label: string }[];
    placeholder?: string;
    className?: string;
}

const StatusFilter: React.FC<ClearableSelectProps> = ({
    label = "",
    value,
    onChange,
    options,
    className = "",
}) => {
    return (
        <FormControl  variant="outlined" className={`main-text__field filter-text__field ${className}`}>
            <Select
                value={value}
                onChange={(e) => onChange(e.target.value)}
                input={
                    <OutlinedInput
                        endAdornment={
                        value ? (
                            <InputAdornment position="end">
                            <IconButton
                                size="small"
                                onClick={() => onChange("")}
                                edge="end"
                                sx={{ mr: 1 }}
                            >
                                <ClearIcon fontSize="small" />
                            </IconButton>
                            </InputAdornment>
                        ) : null
                        }
                        label={label}
                    />
                }
                displayEmpty
                MenuProps={{ disableScrollLock: true }}
            >
                {options.map((opt) => (
                    <MenuItem key={opt.value} value={opt.value}>
                        {opt.label}
                    </MenuItem>
                ))}
            </Select>
        </FormControl>
    );
};

export default StatusFilter;