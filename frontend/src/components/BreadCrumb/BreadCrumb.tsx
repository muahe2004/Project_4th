import * as React from "react";
import { Link } from "react-router-dom";

import "./BreadCrumb.css";

export interface BreadCrumbItem {
    label: string;
    to?: string;
    onClick?: () => void;
}

interface BreadCrumbProps {
    items: BreadCrumbItem[];
    separator?: React.ReactNode;
    className?: string;
}

export default function BreadCrumb({
    items,
    separator = "/",
    className,
}: BreadCrumbProps) {
    const containerClassName = ["breadcrumb", className].filter(Boolean).join(" ");

    return (
        <nav className={containerClassName} aria-label="breadcrumb">
            <ol className="breadcrumb__list">
                {items.map((item, index) => {
                const isLast = index === items.length - 1;
                const showSeparator = !isLast;
                let content: React.ReactNode;

                if (!isLast && item.to) {
                    content = (
                    <Link className="breadcrumb__link" to={item.to}>
                        {item.label}
                    </Link>
                    );
                } else if (!isLast && item.onClick) {
                    content = (
                    <button
                        type="button"
                        className="breadcrumb__link breadcrumb__button"
                        onClick={item.onClick}
                    >
                        {item.label}
                    </button>
                    );
                } else {
                    content = (
                    <span className="breadcrumb__current" aria-current="page">
                        {item.label}
                    </span>
                    );
                }

                return (
                    <li className="breadcrumb__list-item" key={`${item.label}-${index}`}>
                    {content}
                    {showSeparator ? (
                        <span className="breadcrumb__separator" aria-hidden="true">
                        {separator}
                        </span>
                    ) : null}
                    </li>
                );
                })}
            </ol>
        </nav>
    );
}