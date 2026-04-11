import Checkbox from "@mui/material/Checkbox";
import FormControlLabel from "@mui/material/FormControlLabel";
import type { CheckboxProps } from "@mui/material/Checkbox";
import "./CheckBox.css";

type CheckBoxProps = CheckboxProps & {
    label?: string;
    className?: string;
    labelPlacement?: "end" | "start" | "top" | "bottom";
};

export function CheckBox({
    label,
    className = "",
    labelPlacement = "end",
    ...props
}: CheckBoxProps) {
    const checkboxNode = (
        <Checkbox
            {...props}
            className={`uni-checkbox ${className}`.trim()}
            disableRipple
        />
    );

    if (!label) {
        return checkboxNode;
    }

    return (
        <FormControlLabel
            className="uni-checkbox-label"
            control={checkboxNode}
            label={label}
            labelPlacement={labelPlacement}
        />
    );
}

export default CheckBox;
