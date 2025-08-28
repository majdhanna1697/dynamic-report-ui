import { CSSProperties } from "react";
import { Button, ButtonProps, CircularProgress } from "@mui/material";
import "./styles.scss";

export interface MyButtonProps extends ButtonProps {
	buttonStyle?: "primary" | "outline" | "soft" | "disabled" | "error" | "transparent";
	loadingPos?: "left" | "right" | "override";
	isLoading?: boolean;
	isLoadingColor?: string;
	containerStyle?: CSSProperties;
	labelStyle?: CSSProperties;
	cssClassName?: string;
	cssBodyClassName?: string;
}

function MyButton(props: MyButtonProps) {
	const {
		children,
		buttonStyle,
		isLoading,
		containerStyle = {},
		isLoadingColor,
		disabled = false,
		labelStyle,
		cssClassName,
		cssBodyClassName,
		loadingPos = "override",
		...buttonProps
	} = props;

	const getButtonBGStyle = (): CSSProperties => {
		switch (buttonStyle) {
			case "outline":
				return {
					backgroundColor: "transparent",
					borderWidth: 1,
					borderColor: "var(--primary)",
				};
			case "soft":
				return {
					backgroundColor: "transparent",
					border: "1px solid var(--border)",
					color: "var(--text)",
				};
			case "disabled":
				return {
					backgroundColor: "var(--border)",
					borderWidth: 1,
					borderColor: "var(--border)",
					opacity: 0.6,
				};
			case "error":
				return {
					backgroundColor: "var(--red)",
				};
			case "transparent":
				return {
					backgroundColor: "transparent",
					padding: 0,
					boxShadow: "unset !important",
				};
			default:
				return {
					backgroundColor: "var(--primary)",
					color: "var(--text)",
				};
		}
	};

	const getButtonLabelStyle = (): CSSProperties => {
		switch (buttonStyle) {
			case "outline":
				return {
					color: "var(--primary)",
				};

			case "soft":
				return {
					color: "var(--text)",
				};
			case "disabled":
				return {
					color: "var(--lightText)",
				};
			case "error":
				return {
					color: "#FFF",
				};
			case "transparent":
				return {
					color: "var(--text)",
				};
			default:
				return {
					color: "#FFF",
				};
		}
	};

	return (
		<Button
			className={`my-button ${cssClassName}`}
			size="medium"
			variant={buttonStyle?.includes("outline") ? "outlined" : "contained"}
			{...buttonProps}
			style={{ ...getButtonBGStyle(), ...containerStyle }}
			disabled={isLoading || disabled}
			sx={
				["outline"].includes(buttonStyle)
					? {
							"& .MuiTouchRipple-root .MuiTouchRipple-rippleVisible": {
								color: "var(--primary)",
							},
					  }
					: undefined
			}
		>
			{isLoading === true && loadingPos !== "right" && (
				<CircularProgress style={{ color: isLoadingColor || buttonStyle === "soft" ? "var(--tint)" : "#FFF", width: 20, height: 20 }} />
			)}
			{!(isLoading && loadingPos === "override") && (
				<label className={`my-button-label ${cssBodyClassName}`} style={{ ...getButtonLabelStyle(), ...labelStyle }}>
					{children}
				</label>
			)}
			{isLoading === true && loadingPos === "right" && (
				<CircularProgress style={{ color: isLoadingColor || buttonStyle === "soft" ? "var(--tint)" : "#FFF", width: 20, height: 20 }} />
			)}
		</Button>
	);
}

export default MyButton;
