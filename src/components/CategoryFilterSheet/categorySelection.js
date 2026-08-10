// 分類選擇物件（{ 第一層: [第二層, ...] }）的共用工具
//
// groups 格式：[{ name, label, subs: string[] }]
//   name  = 實際的第一層 key（可能是空字串）
//   label = 顯示文字
//   subs  = 第二層清單；為空代表這個第一層本身就是可勾選的末端項目

// 攤平成「實際被勾選的項目名稱」，依 groups 順序排列以固定顯示順序
export const flattenSelection = (groups, selection) => {
  const names = [];
  groups.forEach(({ name, label, subs }) => {
    const picked = selection?.[name];
    if (!picked) return;
    // 空陣列代表「整個第一層被選取」
    if (picked.length === 0 || subs.length === 0) names.push(label);
    else picked.forEach(sub => names.push(sub));
  });
  return names;
};

// 觸發器文字：未選 -> placeholder、1 項 -> 該項名稱、多項 -> 首項 +N
export const getTriggerLabel = (groups, selection, placeholder = '選擇分類') => {
  const names = flattenSelection(groups, selection);
  if (names.length === 0) return placeholder;
  if (names.length === 1) return names[0];
  return `${names[0]} +${names.length - 1}`;
};

// 開啟面板時把「整個第一層被選取」（空陣列）展開成實際的第二層清單，
// 否則勾選狀態會是空的、但計數卻有值，看起來會對不起來。
export const expandSelection = (groups, selection) => {
  const next = {};
  groups.forEach(({ name, subs }) => {
    const picked = selection?.[name];
    if (!picked) return;
    if (subs.length > 0 && picked.length === 0) next[name] = [...subs];
    else next[name] = [...picked];
  });
  return next;
};
