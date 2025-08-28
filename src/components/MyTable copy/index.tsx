import { ChangeEvent, cloneElement, CSSProperties, Fragment, useEffect, useRef, useState } from "react";
import UnfoldMoreIcon from "@mui/icons-material/UnfoldMore";
import KeyboardArrowDownOutlinedIcon from "@mui/icons-material/KeyboardArrowDownOutlined";
import KeyboardArrowUpOutlinedIcon from "@mui/icons-material/KeyboardArrowUpOutlined";
import "./styles.scss";
import { sortJsonByKey } from "src/assets/helpers/objects";
import KeyboardDoubleArrowLeftIcon from "@mui/icons-material/KeyboardDoubleArrowLeft";
import KeyboardArrowLeftIcon from "@mui/icons-material/KeyboardArrowLeft";
import KeyboardDoubleArrowRightIcon from "@mui/icons-material/KeyboardDoubleArrowRight";
import KeyboardArrowRightIcon from "@mui/icons-material/KeyboardArrowRight";
import { CircularProgress } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import { formatDateSmart } from "src/assets/helpers/dates";
import Skeleton from "react-loading-skeleton";
import ClearOutlinedIcon from "@mui/icons-material/ClearOutlined";
import RefreshIcon from "@mui/icons-material/Refresh";
import React from "react";

interface TableActionButton {
	label: string;
	action: (selectedRows: string[]) => void;
	icon: React.ReactElement<any, any>;
	disabled?: boolean | ((selectedRows: string[]) => boolean);
	loading?: boolean;
}

interface TableColumn {
	key: string;
	label: string;
	type?: "text" | "number" | "date";
	render?: (value: TableColumn, index: number) => React.ReactNode;
	style?: CSSProperties;
}

interface MyTableProps {
	columns: TableColumn[];
	data: any[];
	selectable?: boolean;
	rowKey?: string;
	rowsPerPage?: number;
	initPage?: number;
	refreshing?: boolean;
	searchColumnKeys?: string[];
	sortableColumnKeys?: string[];
	actionButtons?: TableActionButton[];
	loading?: boolean;
	expandable?: boolean;
	renderExpandedRow?: (row: any, rowIndex: number) => React.ReactNode;
	onRefresh?: () => void;
}

const DEFAULT_ROWS_PER_PAGE = 30;
const TABLE_ROWS_IN_PAGE_OPTIONS = [10, 20, 30, 50, 100];

export default function MyTable(props: MyTableProps) {
	const {
		columns,
		data,
		selectable = false,
		rowKey = "key",
		rowsPerPage,
		initPage = 1,
		refreshing = false,
		searchColumnKeys = [],
		sortableColumnKeys = [],
		actionButtons,
		loading = false,
		expandable = false,
		renderExpandedRow,
		onRefresh,
	} = props;

	const searchRef = useRef<HTMLInputElement>(null);
	const selectAllRef = useRef<HTMLInputElement>(null);

	const [sortedColumn, setSortedColumn] = useState<string | null>(null);
	const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
	const [selectedRows, setSelectedRows] = useState<string[]>([]);
	const [expandedRows, setExpandedRows] = useState<Set<string | number>>(new Set());
	const [lastSelectedIndex, setLastSelectedIndex] = useState<number | null>(null);
	const [dataToRender, setDataToRender] = useState(data);
	const [searchValue, setSearchValue] = useState("");
	const [currentPage, setCurrentPage] = useState(initPage);

	const storedTableSize = localStorage.getItem("tableSize");
	const [pageSize, setPageSize] = useState(rowsPerPage ? rowsPerPage : storedTableSize ? Number(storedTableSize) : DEFAULT_ROWS_PER_PAGE);
	const paginatedData = dataToRender.slice((currentPage - 1) * pageSize, currentPage * pageSize);
	const totalPages = Math.ceil(dataToRender.length / pageSize);

	useEffect(() => {
		let filtered =
			searchColumnKeys?.length > 0
				? data.filter((row) => (searchValue.trim() === "" ? true : searchColumnKeys.some((col) => String(row[col]).toLowerCase().includes(searchValue.toLowerCase()))))
				: data;

		if (sortedColumn) {
			filtered = sortJsonByKey(filtered, sortedColumn, sortDirection);
		}

		setDataToRender(filtered);
		setCurrentPage(1);
	}, [data, searchValue, searchColumnKeys, sortedColumn, sortDirection]);

	useEffect(() => {
		if (selectAllRef.current) {
			const visibleIds = paginatedData.map((row) => row[rowKey]);
			const someSelected = visibleIds.some((id) => selectedRows.includes(id));
			const allSelected = visibleIds.every((id) => selectedRows.includes(id));
			selectAllRef.current.indeterminate = someSelected && !allSelected;
		}
	}, [selectedRows, paginatedData]);

	const onPageSizeChange = (event: ChangeEvent<HTMLSelectElement>) => {
		const newPageSize = Number(event.target.value);
		localStorage.setItem("tableSize", newPageSize.toString());
		setPageSize(newPageSize);
		setCurrentPage(1);
	};

	const goToPage = (page: number) => {
		const safePage = Math.max(1, Math.min(page, totalPages));
		setCurrentPage(safePage);
	};

	const onCheckboxToggle = (rowKeyValue: string, index: number, event: ChangeEvent<HTMLInputElement>) => {
		const nativeEvent = event.nativeEvent as MouseEvent;
		const isShift = nativeEvent.shiftKey;
		const isChecked = selectedRows.includes(rowKeyValue);

		if (isShift && lastSelectedIndex !== null) {
			const start = Math.min(lastSelectedIndex, index);
			const end = Math.max(lastSelectedIndex, index);
			const visibleIds = paginatedData.map((row) => row[rowKey]);
			const range = visibleIds.slice(start, end + 1);

			setSelectedRows((prev) => {
				const newSelection = isChecked ? prev.filter((id) => !range.includes(id)) : Array.from(new Set([...prev, ...range]));

				return newSelection;
			});
		} else {
			setSelectedRows((prev) => (isChecked ? prev.filter((id) => id !== rowKeyValue) : [...prev, rowKeyValue]));
			setLastSelectedIndex(index);
		}
	};

	const toggleAll = () => {
		const visibleIds = paginatedData.map((row) => row[rowKey]);
		const isPageFullySelected = visibleIds.every((id) => selectedRows.includes(id));

		if (isPageFullySelected) {
			setSelectedRows((prev) => prev.filter((id) => !visibleIds.includes(id)));
		} else {
			setSelectedRows((prev) => Array.from(new Set([...prev, ...visibleIds])));
		}
	};

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

	const onHeaderColumnClick = (column: TableColumn) => () => {
		if (loading || (sortableColumnKeys && !sortableColumnKeys.includes(column.key))) {
			return;
		}

		if (sortedColumn === column.key) {
			setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
		} else {
			setSortedColumn(column.key);
			setSortDirection("asc");
		}
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

	const onClearSearchValue = () => {
		setSearchValue("");
		if (searchRef.current) {
			searchRef.current.focus();
		}
	};

	const toggleExpand = (rowId: string | number) => {
		setExpandedRows((prev) => {
			const newSet = new Set(prev);
			if (newSet.has(rowId)) newSet.delete(rowId);
			else newSet.add(rowId);
			return newSet;
		});
	};

	return (
		<div className="my-table-container">
			<div className="my-table-header-container" style={{ margin: searchColumnKeys.length === 0 ? 0 : undefined }}>
				<div className="my-table-header-container-left">
					{searchColumnKeys.length > 0 && (
						<div className="my-table-search-wrapper">
							<SearchIcon className="my-table-search-icon" />
							<input
								ref={searchRef}
								className="my-table-search-input"
								type="text"
								placeholder="Search table..."
								value={searchValue}
								onChange={(e) => setSearchValue(e.target.value)}
							/>
							{searchValue?.length > 0 && (
								<button className="my-table-clear-search-btn" onClick={onClearSearchValue}>
									<ClearOutlinedIcon className="my-table-clear-search-icon" />
								</button>
							)}
						</div>
					)}
				</div>
				<div className="my-table-header-container-right"></div>
			</div>
			{actionButtons?.length > 0 && (
				<div className="my-table-actions-bar">
					{actionButtons.map((action, a) => {
						const isDisabled = typeof action.disabled === "function" ? action.disabled(selectedRows) : !!action.disabled;
						const isLoading = !!action.loading;

						return (
							<button key={a} className="my-table-action-btn" onClick={() => action.action(selectedRows)} disabled={isDisabled || isLoading}>
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
				<div className="my-table-top-info-left">
					{selectable && (
						<div className="my-table-top-info-data-container">
							<span className="my-table-top-info-data-value">{selectedRows.length.toLocaleString()}</span>
							<span className="my-table-top-info-data-label">Selected</span>
						</div>
					)}
				</div>
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
						{selectable && (
							<th className="my-table-column">
								<input
									ref={selectAllRef}
									className="my-table-checkbox-column"
									type="checkbox"
									checked={paginatedData.length > 0 && paginatedData.every((row) => selectedRows.includes(row[rowKey]))}
									onChange={toggleAll}
									disabled={loading}
								/>
							</th>
						)}
						{columns.map((column) => (
							<th
								key={column.key}
								className={`my-table-column ${loading || (sortableColumnKeys && !sortableColumnKeys.includes(column.key)) ? "" : "sortable"}`}
								onClick={onHeaderColumnClick(column)}
							>
								{column.label}
								{loading || (sortableColumnKeys && !sortableColumnKeys.includes(column.key)) ? null : sortedColumn === column.key ? (
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
						{expandable && <th className="my-table-column"></th>}
					</tr>
				</thead>
				<tbody className="my-table-body">
					{loading ? (
						Array(Math.min(pageSize, DEFAULT_ROWS_PER_PAGE / 2))
							.fill(0)
							.map((_, i) => (
								<tr key={i} className="my-table-row my-table-body-row">
									{Array(columns.length + (selectable ? 1 : 0) + (expandable ? 1 : 0))
										.fill(0)
										.map((_, c) => (
											<td className="my-table-column" key={c}>
												<Skeleton height={16} baseColor="var(--border)" highlightColor="var(--onBackground)" />
											</td>
										))}
								</tr>
							))
					) : paginatedData.length === 0 ? (
						<tr>
							<td colSpan={columns.length + (selectable ? 1 : 0) + (expandable ? 1 : 0)} className="my-table-empty-row">
								Nothing to show
							</td>
						</tr>
					) : (
						paginatedData.map((row, r) => {
							const rowId = row[rowKey];
							const isChecked = selectedRows.includes(rowId);
							const isExpanded = expandedRows.has(rowId);

							return (
								<Fragment key={rowId}>
									<tr className="my-table-row my-table-body-row">
										{selectable && (
											<td className={`my-table-column ${isExpanded ? "expanded" : ""}`}>
												<input
													className="my-table-checkbox-column"
													type="checkbox"
													checked={isChecked}
													onChange={(e) => {
														e.stopPropagation();
														onCheckboxToggle(rowId, r, e);
													}}
												/>
											</td>
										)}
										{columns.map((column, c) => (
											<td key={c} className={`my-table-column ${isExpanded ? "expanded" : ""}`} style={column.style}>
												{getColumnValue(column, row, r)}
											</td>
										))}
										{expandable && (
											<td className={`my-table-column ${isExpanded ? "expanded" : ""}`}>
												<button
													className={`my-table-expand-column ${isExpanded ? "expanded" : ""}`}
													onClick={(e) => {
														e.stopPropagation();
														toggleExpand(rowId);
													}}
												>
													<KeyboardArrowDownOutlinedIcon className="my-table-expand-icon" />
												</button>
											</td>
										)}
									</tr>
									{expandable && isExpanded && r % 2 !== 0 && <tr />}
									{expandable && isExpanded && (
										<tr className="my-table-expanded-row" style={{ backgroundColor: r % 2 ? "rgba(0, 0, 0, 0.05)" : "transparent" }}>
											<td colSpan={columns.length + (selectable ? 1 : 0) + (expandable ? 1 : 0)} className="my-table-expanded-row-content">
												{renderExpandedRow?.(row, r) || <p className="my-table-expanded-row-empty">Nothing to show</p>}
											</td>
										</tr>
									)}
									{expandable && isExpanded && r % 2 === 0 && <tr />}
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
						<select className="my-table-show-rows-select" onChange={onPageSizeChange} value={pageSize} disabled={loading}>
							{[...new Set([...TABLE_ROWS_IN_PAGE_OPTIONS, pageSize])]
								.sort((a, b) => a - b)
								.map((option, i) => (
									<option key={i} value={option}>
										{option}
									</option>
								))}
						</select>
					</div>
					<div className="mt-table-pages-select-container">
						<button className="my-table-page-select-btn" onClick={() => goToPage(1)} disabled={currentPage === 1 || loading}>
							<KeyboardDoubleArrowLeftIcon className="my-table-page-select-icon" />
						</button>
						<button className="my-table-page-select-btn" onClick={() => goToPage(currentPage - 1)} disabled={currentPage === 1 || loading}>
							<KeyboardArrowLeftIcon className="my-table-page-select-icon" />
						</button>

						{getVisiblePages().map((page) => (
							<button key={page} className={`my-table-page-select-btn ${page === currentPage ? "active" : ""}`} onClick={() => goToPage(page)}>
								<label className="my-table-page-select-label">{page}</label>
							</button>
						))}

						<button className="my-table-page-select-btn" onClick={() => goToPage(currentPage + 1)} disabled={currentPage === totalPages || loading}>
							<KeyboardArrowRightIcon className="my-table-page-select-icon" />
						</button>
						<button className="my-table-page-select-btn" onClick={() => goToPage(totalPages)} disabled={currentPage === totalPages || loading}>
							<KeyboardDoubleArrowRightIcon className="my-table-page-select-icon" />
						</button>
					</div>
				</div>
				{!loading && (
					<div className="my-table-showing-info">
						Showing <b>{((currentPage - 1) * pageSize + 1).toLocaleString()}</b> to <b>{Math.min(currentPage * pageSize, dataToRender.length).toLocaleString()}</b> of{" "}
						<b>{dataToRender.length.toLocaleString()}</b> entries
					</div>
				)}
			</div>
		</div>
	);
}
