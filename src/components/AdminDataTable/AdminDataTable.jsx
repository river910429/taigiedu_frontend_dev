import { useState, useMemo, useCallback } from 'react';
import PropTypes from 'prop-types';
import {
    useReactTable,
    getCoreRowModel,
    getSortedRowModel,
    flexRender,
} from '@tanstack/react-table';

// 拖曳功能
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragOverlay
} from '@dnd-kit/core';
import {
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
    useSortable
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

import './AdminDataTable.css';
import dragIcon from '../../assets/adminPage/bars-2.png';

/**
 * 可拖曳的表格行組件
 */
const SortableTableRow = ({ row, children }) => {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: row.original.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        zIndex: isDragging ? 10 : 0,
        opacity: isDragging ? 0.5 : 1,
    };

    return (
        <tr ref={setNodeRef} style={style} className={isDragging ? 'dragging-row' : ''}>
            {/* 拖曳句柄 */}
            <td className="drag-handle-column">
                <button className="drag-handle-btn" {...listeners} {...attributes}>
                    <img src={dragIcon} alt="拖曳" className="drag-handle-icon" />
                </button>
            </td>
            {children}
        </tr>
    );
};

SortableTableRow.propTypes = {
    row: PropTypes.object.isRequired,
    children: PropTypes.node.isRequired,
};

/**
 * 通用管理後台資料表格組件
 * 
 * @param {Array} data - 表格資料
 * @param {Array} columns - 欄位定義
 * @param {boolean} enableSorting - 是否啟用排序功能
 * @param {boolean} enableDragging - 是否啟用拖曳排序功能
 * @param {Function} onDragEnd - 拖曳結束時的回調函數
 * @param {Object} emptyState - 空資料狀態的設定
 * @param {Object} loadingState - 載入中狀態的設定
 * @param {boolean} isLoading - 是否正在載入中
 * @param {string|null} error - 錯誤訊息
 * @param {Function} onRetry - 重試回調函數
 * @param {string} tableClassName - 自訂表格 className
 */
const AdminDataTable = ({
    data = [],
    columns = [],
    enableSorting = true,
    enableDragging = true,
    onDragEnd,
    emptyState = { message: '目前沒有資料' },
    isLoading = false,
    error = null,
    onRetry,
    tableClassName = '',
}) => {
    const [sorting, setSorting] = useState([]);
    const [activeId, setActiveId] = useState(null);

    // 拖曳感應器設定
    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    // TanStack Table 欄位設定
    const tableColumns = useMemo(() => columns, [columns]);

    // TanStack Table 實例
    const table = useReactTable({
        data,
        columns: tableColumns,
        state: {
            sorting,
        },
        onSortingChange: setSorting,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: enableSorting ? getSortedRowModel() : undefined,
        enableSorting,
    });

    // 拖曳事件處理
    const handleDragStart = useCallback((event) => {
        setActiveId(event.active.id);
    }, []);

    const handleDragEnd = useCallback((event) => {
        const { active, over } = event;
        if (active.id !== over?.id && onDragEnd) {
            onDragEnd(active.id, over?.id);
        }
        setActiveId(null);
    }, [onDragEnd]);

    const handleDragCancel = useCallback(() => {
        setActiveId(null);
    }, []);

    // 找到正在拖曳的項目
    const activeItem = useMemo(
        () => data.find((item) => item.id === activeId),
        [activeId, data]
    );

    // 載入中狀態
    if (isLoading) {
        return (
            <div className="admin-table-loading">
                <div className="loading-spinner"></div>
                <p>載入中...</p>
            </div>
        );
    }

    // 錯誤狀態
    if (error) {
        return (
            <div className="admin-table-loading">
                <p>載入失敗，請重新整理頁面</p>
                {onRetry && (
                    <button onClick={onRetry} className="btn btn-primary mt-2">
                        重新載入
                    </button>
                )}
            </div>
        );
    }

    // 空資料狀態
    if (data.length === 0) {
        return (
            <div className="admin-table-empty text-center py-5">
                <p>{emptyState.message}</p>
            </div>
        );
    }

    // 渲染表格內容
    const renderTableContent = () => (
        <table className={`table admin-data-table ${tableClassName}`}>
            <thead>
                {table.getHeaderGroups().map((headerGroup) => (
                    <tr key={headerGroup.id}>
                        {/* 拖曳列的空表頭 */}
                        {enableDragging && <th style={{ width: '40px' }}></th>}
                        {headerGroup.headers.map((header) => (
                            <th
                                key={header.id}
                                className={header.column.getCanSort() ? 'admin-table-header sortable' : 'admin-table-header'}
                                onClick={header.column.getToggleSortingHandler()}
                                style={{
                                    cursor: header.column.getCanSort() ? 'pointer' : 'default',
                                    width: header.column.columnDef.size || 'auto',
                                }}
                            >
                                {flexRender(
                                    header.column.columnDef.header,
                                    header.getContext()
                                )}
                                {header.column.getCanSort() && (
                                    <span className="sort-arrow">
                                        {{
                                            asc: '↑',
                                            desc: '↓',
                                        }[header.column.getIsSorted()] ?? '↓'}
                                    </span>
                                )}
                            </th>
                        ))}
                    </tr>
                ))}
            </thead>
            {enableDragging ? (
                <SortableContext
                    items={data.map((item) => item.id)}
                    strategy={verticalListSortingStrategy}
                >
                    <tbody>
                        {table.getRowModel().rows.map((row) => (
                            <SortableTableRow key={row.id} row={row}>
                                {row.getVisibleCells().map((cell) => (
                                    <td key={cell.id}>
                                        {flexRender(
                                            cell.column.columnDef.cell,
                                            cell.getContext()
                                        )}
                                    </td>
                                ))}
                            </SortableTableRow>
                        ))}
                    </tbody>
                </SortableContext>
            ) : (
                <tbody>
                    {table.getRowModel().rows.map((row) => (
                        <tr key={row.id}>
                            {row.getVisibleCells().map((cell) => (
                                <td key={cell.id}>
                                    {flexRender(
                                        cell.column.columnDef.cell,
                                        cell.getContext()
                                    )}
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            )}
        </table>
    );

    // 渲染拖曳覆層
    const renderDragOverlay = () => {
        if (!activeItem) return null;

        return (
            <table className="table admin-data-table drag-overlay-table">
                <tbody>
                    <tr className="dragging-overlay-row">
                        <td className="drag-handle-column">
                            <img src={dragIcon} alt="拖曳" className="drag-handle-icon" />
                        </td>
                        {columns.map((column) => (
                            <td key={column.id || column.accessorKey}>
                                {column.cell
                                    ? column.cell({
                                        row: { original: activeItem },
                                        getValue: () => activeItem[column.accessorKey]
                                    })
                                    : activeItem[column.accessorKey]
                                }
                            </td>
                        ))}
                    </tr>
                </tbody>
            </table>
        );
    };

    return (
        <div className="admin-table-responsive">
            {enableDragging ? (
                <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragStart={handleDragStart}
                    onDragEnd={handleDragEnd}
                    onDragCancel={handleDragCancel}
                >
                    {renderTableContent()}
                    <DragOverlay>
                        {renderDragOverlay()}
                    </DragOverlay>
                </DndContext>
            ) : (
                renderTableContent()
            )}
        </div>
    );
};

AdminDataTable.propTypes = {
    data: PropTypes.array.isRequired,
    columns: PropTypes.array.isRequired,
    enableSorting: PropTypes.bool,
    enableDragging: PropTypes.bool,
    onDragEnd: PropTypes.func,
    emptyState: PropTypes.shape({
        message: PropTypes.string,
    }),
    isLoading: PropTypes.bool,
    error: PropTypes.string,
    onRetry: PropTypes.func,
    tableClassName: PropTypes.string,
};

export default AdminDataTable;
