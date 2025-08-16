import React from "react";
import "./Label.css"

interface LabelPrimaryProps {
    value: string;
    className?: string;
    required?: boolean;  
}

const LabelPrimary: React.FC<LabelPrimaryProps> = ({
    className,
    value,
    required,
    ...rest
}) => {
    const defaultClassname = `label-primary ${className}`.trim();

    return (
        <span
        className={defaultClassname}
        {...rest}
        >
        {value}
        {
            required && (
                <span className="label-primary__required">*</span>
            )
        }
        </span>
    );
};

export default LabelPrimary;