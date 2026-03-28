import Select from "react-select";

const makeStyles = (isError = false) => ({
    container: (b) => ({ ...b, flex: 1, minWidth: 0 }),
    control: (b, s) => ({
        ...b,
        backgroundColor: "var(--surface-2)",
        borderColor: isError
            ? "var(--error, #f87171)"
            : s.isFocused ? "var(--accent)" : "var(--border)",
        boxShadow: isError
            ? (s.isFocused ? "0 0 0 3px rgba(248,113,113,0.18)" : "none")
            : (s.isFocused ? "0 0 0 3px var(--accent-glow-sm)" : "none"),
        borderRadius: "var(--radius-sm)",
        minHeight: 46,
        cursor: "pointer",
        transition: "border-color 0.2s, box-shadow 0.2s",
        "&:hover": {
            borderColor: isError
                ? "var(--error, #f87171)"
                : s.isFocused ? "var(--accent)" : "var(--border)",
        },
    }),
    valueContainer: (b) => ({ ...b, padding: "0 10px" }),
    singleValue:    (b) => ({ ...b, color: "var(--text)", margin: 0 }),
    placeholder:    (b) => ({ ...b, color: "var(--text-dim)", margin: 0 }),
    input:          (b) => ({ ...b, color: "var(--text)", margin: 0, padding: 0 }),
    indicatorSeparator: () => ({ display: "none" }),
    dropdownIndicator: (b, s) => ({
        ...b,
        color: "var(--text-muted)",
        padding: "0 8px",
        transition: "transform 0.2s, color 0.2s",
        transform: s.selectProps.menuIsOpen ? "rotate(180deg)" : "rotate(0deg)",
        "&:hover": { color: "var(--text)" },
    }),
    menu: (b) => ({
        ...b,
        backgroundColor: "var(--surface-2)",
        border: "1px solid var(--border)",
        borderRadius: "var(--radius-sm)",
        boxShadow: "0 8px 24px rgba(0,0,0,0.5)",
        zIndex: 10,
    }),
    menuList: (b) => ({
        ...b,
        padding: "4px",
        scrollbarWidth: "thin",
        scrollbarColor: "rgba(255,255,255,0.12) transparent",
    }),
    option: (b, s) => ({
        ...b,
        backgroundColor: s.isSelected ? "var(--accent)"
            : s.isFocused  ? "rgba(255,255,255,0.05)"
            : "transparent",
        color: s.isSelected ? "#fff" : "var(--text)",
        fontSize: 14,
        padding: "8px 10px",
        borderRadius: 6,
        cursor: "pointer",
        "&:active": { backgroundColor: "var(--accent)" },
    }),
    noOptionsMessage: (b) => ({ ...b, color: "var(--text-dim)", fontSize: 14 }),
});

function SelectBox({ isError = false, ...props }) {
    return (
        <Select
            styles={makeStyles(isError)}
            classNamePrefix="app-select"
            {...props}
        />
    );
}

export default SelectBox;
