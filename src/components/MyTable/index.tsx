import { ChangeEvent, cloneElement, CSSProperties, Fragment } from "react";
import UnfoldMoreIcon from "@mui/icons-material/UnfoldMore";
import KeyboardArrowDownOutlinedIcon from "@mui/icons-material/KeyboardArrowDownOutlined";
import KeyboardArrowUpOutlinedIcon from "@mui/icons-material/KeyboardArrowUpOutlined";
import "./styles.scss";
import KeyboardDoubleArrowLeftIcon from "@mui/icons-material/KeyboardDoubleArrowLeft";
import KeyboardArrowLeftIcon from "@mui/icons-material/KeyboardArrowLeft";
import KeyboardDoubleArrowRightIcon from "@mui/icons-material/KeyboardDoubleArrowRight";
import KeyboardArrowRightIcon from "@mui/icons-material/KeyboardArrowRight";
import { CircularProgress } from "@mui/material";
import { formatDateSmart } from "src/assets/helpers/dates";
import Skeleton from "react-loading-skeleton";
import RefreshIcon from "@mui/icons-material/Refresh";
import React from "react";

interface TableActionButton {
	label: string;
	action: () => void;
	icon: React.ReactElement<any, any>;
	disabled?: boolean | (() => boolean);
	loading?: boolean;
}

export interface TableColumn {
	key: string;
	label: string;
	type?: "text" | "number" | "date";
	dbColumn?: string;
	render?: (value: TableColumn, index: number) => React.ReactNode;
	style?: CSSProperties;
}

interface MyTableProps {
	columns: TableColumn[];
	data: any[];
	rowKey?: string;
	refreshing?: boolean;
	sortableColumnKeys?: string[];
	actionButtons?: TableActionButton[];
	loading?: boolean;
	sortedColumn?: string;
	sortDirection?: string;
	currentPage: number;
	pageSizeOptions: Array<number>;
	pageSize: number;
	totalPages: number;
	totalRows: number;
	onRefresh?: () => void;
	onPageSizeChange?: (event: ChangeEvent<HTMLSelectElement>) => void;
	goToPage?: (page: number) => void;
	onHeaderColumnSort?: (column: string, direction: "asc" | "desc") => void;
}

export default function MyTable(props: MyTableProps) {
	const {
		columns,
		data,
		rowKey,
		refreshing,
		sortableColumnKeys,
		actionButtons,
		loading,
		sortedColumn,
		sortDirection,
		currentPage,
		pageSize,
		totalPages,
		totalRows,
		pageSizeOptions,
		onPageSizeChange,
		onRefresh,
		goToPage,
		onHeaderColumnSort,
	} = props;

	const getColumnValue = (column: TableColumn, row: any, i: number) => {
		if (column.render) {
			return column.render(row, i);
		}

		switch (column.type) {
			case "date":
				return formatDateSmart(row[column.key]);
			default:
				return row[column.key];
		}
	};

	const _onPageSizeChange = (event: ChangeEvent<HTMLSelectElement>) => {
		onPageSizeChange?.(event);
	};

	const _goToPage = (page: number) => {
		goToPage?.(page);
	};

	const getVisiblePages = (): number[] => {
		const maxVisible = 5;
		let startPage = Math.max(currentPage - 2, 1);
		let endPage = startPage + maxVisible - 1;

		if (endPage > totalPages) {
			endPage = totalPages;
			startPage = Math.max(endPage - maxVisible + 1, 1);
		}

		return Array.from({ length: endPage - startPage + 1 }, (_, i) => startPage + i);
	};

	const onHeaderColumnClick = (column: TableColumn) => () => {
		const colKey = column.dbColumn ?? column.key;

		if (loading || !sortableColumnKeys || !sortableColumnKeys.includes(colKey)) {
			return;
		}

		if (sortedColumn === colKey) {
			onHeaderColumnSort?.(colKey, sortDirection === "asc" ? "desc" : "asc");
		} else {
			onHeaderColumnSort?.(colKey, "asc");
		}
	};

	return (
		<div className="my-table-container">
			{actionButtons?.length > 0 && (
				<div className="my-table-actions-bar">
					{actionButtons.map((action, a) => {
						const isDisabled = typeof action.disabled === "function" ? action.disabled() : !!action.disabled;
						const isLoading = !!action.loading;

						return (
							<button key={a} className="my-table-action-btn" onClick={() => action.action()} disabled={isDisabled || isLoading}>
								{action.loading ? (
									<CircularProgress size={14} style={{ color: "var(--primary)" }} />
								) : (
									cloneElement(action.icon, { className: "my-table-action-btn-icon" })
								)}
								<label className="my-table-action-btn-label">{action.label}</label>
							</button>
						);
					})}
				</div>
			)}
			<div className="my-table-top-info">
				<div className="my-table-top-info-left"></div>
				<div className="my-table-top-info-right">
					{refreshing ? (
						<div className="my-table-top-info-data-container">
							<span className="my-table-top-info-data-label">Refreshing...</span>
							<span className="my-table-top-info-data-value">
								<CircularProgress size={13} style={{ color: "var(--primary)" }} />
							</span>
						</div>
					) : !loading && onRefresh ? (
						<button className="my-table-refresh-btn" onClick={onRefresh} disabled={refreshing || loading}>
							<RefreshIcon className="my-table-refresh-btn-icon" />
						</button>
					) : undefined}
				</div>
			</div>
			<table className="my-table">
				<thead className="my-table-header">
					<tr className="my-table-row my-table-header-row">
						{columns.map((column) => (
							<th
								key={column.key}
								className={`my-table-column ${loading || !sortableColumnKeys || !sortableColumnKeys.includes(column.dbColumn ?? column.key) ? "" : "sortable"}`}
								onClick={onHeaderColumnClick(column)}
							>
								{column.label}
								{loading || !sortableColumnKeys || !sortableColumnKeys.includes(column.dbColumn ?? column.key) ? null : sortedColumn ===
								  (column.dbColumn ?? column.key) ? (
									sortDirection === "asc" ? (
										<KeyboardArrowUpOutlinedIcon className="my-table-column-sort-icon" />
									) : (
										<KeyboardArrowDownOutlinedIcon className="my-table-column-sort-icon" />
									)
								) : (
									<UnfoldMoreIcon className="my-table-column-sort-icon" />
								)}
							</th>
						))}
					</tr>
				</thead>
				<tbody className="my-table-body">
					{loading ? (
						Array(Math.min(pageSize, 20 / 2))
							.fill(0)
							.map((_, i) => (
								<tr key={i} className="my-table-row my-table-body-row">
									{Array(columns.length)
										.fill(0)
										.map((_, c) => (
											<td className="my-table-column" key={c}>
												<Skeleton height={16} baseColor="var(--border)" highlightColor="var(--onBackground)" />
											</td>
										))}
								</tr>
							))
					) : data.length === 0 ? (
						<tr>
							<td colSpan={columns.length} className="my-table-empty-row">
								Nothing to show
							</td>
						</tr>
					) : (
						data.map((row, r) => {
							const rowId = row[rowKey];
							return (
								<Fragment key={rowId}>
									<tr className="my-table-row my-table-body-row">
										{columns.map((column, c) => (
											<td key={c} className={`my-table-column`} style={column.style}>
												{getColumnValue(column, row, r)}
											</td>
										))}
									</tr>
								</Fragment>
							);
						})
					)}
				</tbody>
			</table>
			<div className="my-table-footer">
				<div className="my-table-pagination-container">
					<div className="my-table-show-rows-container">
						<label className="my-table-show-rows-label">Show</label>
						<select className="my-table-show-rows-select" onChange={_onPageSizeChange} value={pageSize} disabled={loading}>
							{[...new Set([...pageSizeOptions, pageSize])]
								.sort((a, b) => a - b)
								.map((option, i) => (
									<option key={i} value={option}>
										{option}
									</option>
								))}
						</select>
					</div>
					<div className="mt-table-pages-select-container">
						<button className="my-table-page-select-btn" onClick={() => _goToPage(1)} disabled={currentPage === 1 || loading}>
							<KeyboardDoubleArrowLeftIcon className="my-table-page-select-icon" />
						</button>
						<button className="my-table-page-select-btn" onClick={() => _goToPage(currentPage - 1)} disabled={currentPage === 1 || loading}>
							<KeyboardArrowLeftIcon className="my-table-page-select-icon" />
						</button>

						{getVisiblePages().map((page) => (
							<button key={page} className={`my-table-page-select-btn ${page === currentPage ? "active" : ""}`} onClick={() => _goToPage(page)}>
								<label className="my-table-page-select-label">{page}</label>
							</button>
						))}

						<button className="my-table-page-select-btn" onClick={() => _goToPage(currentPage + 1)} disabled={currentPage === totalPages || loading}>
							<KeyboardArrowRightIcon className="my-table-page-select-icon" />
						</button>
						<button className="my-table-page-select-btn" onClick={() => _goToPage(totalPages)} disabled={currentPage === totalPages || loading}>
							<KeyboardDoubleArrowRightIcon className="my-table-page-select-icon" />
						</button>
					</div>
				</div>
				{!loading && (
					<div className="my-table-showing-info">
						Showing <b>{((currentPage - 1) * pageSize + 1).toLocaleString()}</b> to <b>{Math.min(currentPage * pageSize, totalRows).toLocaleString()}</b> of{" "}
						<b>{totalRows.toLocaleString()}</b> entries
					</div>
				)}
			</div>
		</div>
	);
}
