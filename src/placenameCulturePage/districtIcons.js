// 台語地名與文化 — 行政區 icon（右側 80×80 版位使用）
// 圖檔放在 assets/tainan_map/，檔名即行政區名稱（例：大內區.svg），
// 新增或替換圖檔不需要改這支程式，重新啟動 dev server 即可生效。
const iconModules = import.meta.glob('../assets/tainan_map/*.svg', {
    eager: true,
    query: '?url',
    import: 'default',
});

// { '大內區': '/assets/大內區-xxxxxx.svg', ... }
const DISTRICT_ICONS = Object.fromEntries(
    Object.entries(iconModules).map(([path, url]) => [
        path.split('/').pop().replace(/\.svg$/, ''),
        url,
    ])
);

// 查無對應圖檔時回傳 null，由 IconSlot 顯示空版位
export const getDistrictIcon = (name) => (name ? DISTRICT_ICONS[name] || null : null);

export default DISTRICT_ICONS;
