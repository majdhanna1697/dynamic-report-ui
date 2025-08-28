import { ChangeEvent, CSSProperties, HTMLInputTypeAttribute, InputHTMLAttributes, SelectHTMLAttributes, useEffect, useRef, useState } from "react";
import "./styles.scss";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import React from "react";

interface SelectOption {
	label: string;
	value: string;
	default?: boolean;
}

interface BaseProps {
	label?: string;
	required?: boolean;
	style?: CSSProperties;
	inputStyle?: CSSProperties;
	labelStyle?: CSSProperties;
	onChange?: (event: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
	value?: string;
	placeholder?: string;
	autoFocus?: boolean;
}

interface InputProps extends BaseProps, Omit<InputHTMLAttributes<HTMLInputElement>, "onChange" | "value" | "placeholder"> {
	type?: Exclude<HTMLInputTypeAttribute, "select">;
	options?: never;
}

interface SelectProps extends BaseProps, Omit<SelectHTMLAttributes<HTMLSelectElement>, "onChange" | "value" | "placeholder"> {
	type: "select";
	options: SelectOption[];
}

export type MyInputProps = InputProps | SelectProps;

export default function MyInput(props: MyInputProps) {
	const { label, type = "text", required = false, style, inputStyle, labelStyle, onChange, value, placeholder, autoFocus, ...restProps } = props;

	const inputRef = useRef<HTMLInputElement>(null);
	const selectRef = useRef<HTMLSelectElement>(null);

	const [showPassword, setShowPassword] = useState(false);

	const isSelect = type === "select";

	useEffect(() => {
		if (autoFocus) {
			const timeout = setTimeout(() => {
				const target = isSelect ? selectRef.current : inputRef.current;
				target?.focus({ preventScroll: true });
			}, 500);

			return () => clearTimeout(timeout);
		}
	}, [autoFocus, isSelect]);

	return (
		<div className="my-input" style={style}>
			{label && (
				<label className={`my-input-label ${required ? "required" : ""}`} style={labelStyle}>
					{label}
				</label>
			)}

			{isSelect ? (
				<select
					ref={selectRef}
					className="my-input-select"
					value={value}
					onChange={onChange as React.ChangeEventHandler<HTMLSelectElement>}
					required={required}
					style={inputStyle}
					{...(restProps as React.SelectHTMLAttributes<HTMLSelectElement>)}
				>
					{(props as SelectProps).options.map((option, o) => (
						<option key={o} value={option.value}>
							{option.label}
						</option>
					))}
				</select>
			) : (
				<input
					ref={inputRef}
					className="my-input-input"
					type={type === "password" ? (showPassword ? "text" : "password") : type}
					placeholder={placeholder}
					value={value}
					onChange={onChange as React.ChangeEventHandler<HTMLInputElement>}
					required={required}
					style={inputStyle}
					onWheel={(e) => (e.target as HTMLInputElement).blur()}
					{...(restProps as React.InputHTMLAttributes<HTMLInputElement>)}
				/>
			)}

			{!isSelect && type === "password" && (
				<div className="my-input-password-toggle" onClick={() => setShowPassword(!showPassword)}>
					{showPassword ? <VisibilityOffIcon className="my-input-password-toggle-icon" /> : <VisibilityIcon className="my-input-password-toggle-icon" />}
				</div>
			)}
		</div>
	);
}
