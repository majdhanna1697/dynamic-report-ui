import { useRef } from "react";
import MyButton, { MyButtonProps } from "../MyButton";
import MyInput, { MyInputProps } from "../MyInput";
import "./styles.scss";
import React from "react";

interface MyFormProps {
	inputs: MyInputProps[];
	actionButtons: MyButtonProps[];
	onSubmit?: (e: React.FormEvent<HTMLFormElement>) => void;
}

export default function MyForm(props: MyFormProps) {
	const { inputs, actionButtons, onSubmit } = props;
	const formRef = useRef<HTMLFormElement>(null);

	const onFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		onSubmit?.(e);
	};

	const onButtonClick = (e: React.MouseEvent<HTMLButtonElement>, button: MyButtonProps) => {
		if (formRef.current?.reportValidity()) {
			button.onClick?.(e);
		}
	};

	return (
		<div className="my-form-container">
			<form ref={formRef} className="my-form-wrapper" onSubmit={onFormSubmit}>
				<div className="my-form-inputs">
					{inputs.map((input, i) => (
						<MyInput key={i} {...input} />
					))}
				</div>
				<div className="my-form-action-buttons">
					{actionButtons?.map((button, i) => (
						<MyButton
							key={i}
							{...button}
							containerStyle={{ minHeight: 35, height: 35, ...button.style }}
							buttonStyle={button.type === "submit" ? "primary" : "outline"}
							onClick={button.type === "submit" ? undefined : (e) => onButtonClick(e, button)}
						/>
					))}
				</div>
			</form>
		</div>
	);
}
