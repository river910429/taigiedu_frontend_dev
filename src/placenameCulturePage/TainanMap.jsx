import React, { useMemo } from 'react';
import { MAP_VIEWBOX, TAINAN_DISTRICTS, getDistrict } from './tainanMapData';
import './TainanMap.css';

/**
 * 臺南市行政區地圖（SVG）
 *
 * variant
 *   'full'   完整地圖，可 hover / 點擊各行政區（第一層）
 *   'mini'   縮圖，僅標示目前所在行政區，整張可點擊（第二層左上角）
 *   'single' 只畫單一行政區並放大填滿（第二層主視覺）
 *
 * 路徑資料來自 tainanMapData.js（由 Figma 設計稿匯出）。
 */
const TainanMap = ({
    variant = 'full',
    activeName = null,
    hoveredName = null,
    onHoverDistrict,
    onSelectDistrict,
    onClick,
    showLabel = true,
    className = '',
    ariaLabel = '臺南市行政區地圖',
}) => {
    const isSingle = variant === 'single';
    const isInteractive = variant === 'full';

    const focused = isSingle ? getDistrict(activeName) : null;

    // 單一行政區時，把 viewBox 收斂到該區的邊界（外加 6% 留白）
    const viewBox = useMemo(() => {
        if (!focused) return `0 0 ${MAP_VIEWBOX.width} ${MAP_VIEWBOX.height}`;
        const [x, y, w, h] = focused.bbox;
        const pad = Math.max(w, h) * 0.06;
        return `${x - pad} ${y - pad} ${w + pad * 2} ${h + pad * 2}`;
    }, [focused]);

    const districts = isSingle ? (focused ? [focused] : []) : TAINAN_DISTRICTS;

    // 只有完整地圖需要標示 hover 中的區名
    const labelled = showLabel && variant === 'full' ? getDistrict(hoveredName || activeName) : null;

    // 標籤預設放在區塊中央；區塊太小時移到上方，避免蓋住反白的區塊
    const labelBox = useMemo(() => {
        if (!labelled) return null;
        const width = labelled.name.length * 15 + 16;
        const height = 30;
        const [, boxY, , boxH] = labelled.bbox;
        const cy = boxH < 80 ? boxY - height / 2 - 4 : labelled.label[1];
        return { x: labelled.label[0] - width / 2, y: cy - height / 2, cx: labelled.label[0], cy, width, height };
    }, [labelled]);

    const handleClick = () => {
        if (onClick) onClick();
    };

    return (
        <svg
            className={`pc-map pc-map-${variant} ${className}`}
            viewBox={viewBox}
            preserveAspectRatio="xMidYMid meet"
            role={onClick ? 'button' : 'img'}
            aria-label={ariaLabel}
            onClick={onClick ? handleClick : undefined}
        >
            {districts.map((district) => {
                const isActive = district.name === activeName;
                const isHovered = district.name === hoveredName;
                return (
                    <g
                        key={district.name}
                        className={`pc-map-district${isActive ? ' is-active' : ''}${isHovered ? ' is-hovered' : ''}`}
                        onMouseEnter={isInteractive && onHoverDistrict ? () => onHoverDistrict(district.name) : undefined}
                        onMouseLeave={isInteractive && onHoverDistrict ? () => onHoverDistrict(null) : undefined}
                        onClick={
                            isInteractive && onSelectDistrict
                                ? (event) => {
                                    event.stopPropagation();
                                    onSelectDistrict(district.name);
                                }
                                : undefined
                        }
                        onFocus={isInteractive && onHoverDistrict ? () => onHoverDistrict(district.name) : undefined}
                        onBlur={isInteractive && onHoverDistrict ? () => onHoverDistrict(null) : undefined}
                        onKeyDown={
                            isInteractive && onSelectDistrict
                                ? (event) => {
                                    if (event.key === 'Enter' || event.key === ' ') {
                                        event.preventDefault();
                                        onSelectDistrict(district.name);
                                    }
                                }
                                : undefined
                        }
                        tabIndex={isInteractive ? 0 : undefined}
                        role={isInteractive ? 'button' : undefined}
                        aria-label={isInteractive ? district.name : undefined}
                    >
                        {/* 放大單一行政區時只畫主體，避免原稿殘留的碎點跑到裁切框外 */}
                        {(isSingle ? district.areas.slice(0, district.mainAreas) : district.areas).map((d, index) => (
                            <path key={`a${index}`} className="pc-map-area" d={d} />
                        ))}
                        {(isSingle ? district.lines.slice(0, district.mainLines) : district.lines).map((d, index) => (
                            <path key={`l${index}`} className="pc-map-line" d={d} />
                        ))}
                    </g>
                );
            })}

            {labelBox && (
                <g className="pc-map-label" pointerEvents="none">
                    <rect x={labelBox.x} y={labelBox.y} width={labelBox.width} height={labelBox.height} rx={6} />
                    <text x={labelBox.cx} y={labelBox.cy} textAnchor="middle" dominantBaseline="central">
                        {labelled.name}
                    </text>
                </g>
            )}
        </svg>
    );
};

export default TainanMap;
