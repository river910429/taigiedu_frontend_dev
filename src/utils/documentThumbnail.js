/**
 * 文件縮圖產生器
 *
 * 依上傳的文件自動產生一張 JPEG 縮圖，供後台／前台的預覽縮圖欄位使用：
 *   PDF        → 用 pdfjs-dist 渲染第一頁
 *   DOCX       → 用 mammoth 取出純文字後畫到 canvas
 *   DOC / PPT  → 無法在瀏覽器解析，改畫一張帶檔案類型的佔位圖
 *
 * 產生失敗一律回傳 null（縮圖是選填，不應該擋住上傳流程），由呼叫端決定要不要提示。
 *
 * ⚠️ 這份邏輯與 `resourcePage/UploadResource.jsx` 內的縮圖函式同源。
 * 該檔屬於「共用元件預設不可修改」的範圍（見 CLAUDE.md §9.1），因此這裡先獨立一份給後台使用；
 * 之後若要讓 UploadResource 也改用本模組，需先取得同意再動它。
 */

import mammoth from 'mammoth';
import * as pdfjsLib from 'pdfjs-dist';

pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdn.jsdelivr.net/npm/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;

const JPEG_QUALITY = 0.7;

/** canvas 沒有自動斷行，中文也不能靠空白切，所以逐字量測寬度來換行 */
const wrapText = (ctx, text, maxWidth) => {
  const lines = [];
  let currentLine = '';
  for (const char of text) {
    if (char === '\n') {
      lines.push(currentLine);
      currentLine = '';
      continue;
    }
    const testLine = currentLine + char;
    if (ctx.measureText(testLine).width > maxWidth && currentLine.length > 0) {
      lines.push(currentLine);
      currentLine = char;
    } else {
      currentLine = testLine;
    }
  }
  if (currentLine) lines.push(currentLine);
  return lines;
};

const toJpegBlob = (canvas) =>
  new Promise((resolve) => canvas.toBlob((blob) => resolve(blob), 'image/jpeg', JPEG_QUALITY));

/** PDF：渲染第一頁 */
const generatePdfThumbnail = async (file) => {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  const page = await pdf.getPage(1);

  const viewport = page.getViewport({ scale: 1.5 });
  const canvas = document.createElement('canvas');
  canvas.width = viewport.width;
  canvas.height = viewport.height;
  const ctx = canvas.getContext('2d');

  await page.render({ canvasContext: ctx, viewport }).promise;
  return toJpegBlob(canvas);
};

/** DOCX：取出純文字畫成一頁 A4 比例的預覽 */
const generateDocxThumbnail = async (file) => {
  const arrayBuffer = await file.arrayBuffer();
  const { value: html } = await mammoth.convertToHtml({ arrayBuffer });

  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = html;
  const text = tempDiv.textContent || tempDiv.innerText || '';

  const W = 420;
  const H = 594; // A4 比例
  const canvas = document.createElement('canvas');
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, W, H);

  ctx.strokeStyle = '#d0d0d0';
  ctx.lineWidth = 1;
  ctx.strokeRect(0.5, 0.5, W - 1, H - 1);

  // 頂部色帶（Word 藍）
  ctx.fillStyle = '#2B579A';
  ctx.fillRect(0, 0, W, 5);

  ctx.fillStyle = '#333333';
  ctx.font = '14px "Microsoft JhengHei", "Noto Sans TC", "PingFang TC", sans-serif';

  const lines = wrapText(ctx, text.trim(), W - 48);
  const lineHeight = 22;
  const maxLines = Math.floor((H - 60) / lineHeight);

  for (let i = 0; i < Math.min(lines.length, maxLines); i += 1) {
    ctx.fillText(lines[i], 24, 40 + i * lineHeight);
  }

  // 內容被截斷時，底部做漸層淡出暗示還有後續
  if (lines.length > maxLines) {
    const gradient = ctx.createLinearGradient(0, H - 60, 0, H);
    gradient.addColorStop(0, 'rgba(255,255,255,0)');
    gradient.addColorStop(1, 'rgba(255,255,255,1)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, H - 60, W, 60);
  }

  return toJpegBlob(canvas);
};

/** DOC / PPT：瀏覽器解析不了，畫一張帶檔案類型的佔位圖 */
const generatePlaceholderThumbnail = async (file, type = 'PPT') => {
  const W = 420;
  const H = type === 'PPT' ? 315 : 594; // PPT → 4:3，其他 → A4
  const canvas = document.createElement('canvas');
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d');

  const bg = ctx.createLinearGradient(0, 0, W, H);
  bg.addColorStop(0, '#f8f9fa');
  bg.addColorStop(1, '#e9ecef');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);

  ctx.strokeStyle = '#d0d0d0';
  ctx.lineWidth = 1;
  ctx.strokeRect(0.5, 0.5, W - 1, H - 1);

  ctx.fillStyle = type === 'PPT' ? '#D04423' : '#2B579A';
  ctx.fillRect(W / 2 - 40, H / 2 - 60, 80, 80);

  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 32px Inter, Arial, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(type, W / 2, H / 2 - 20);

  ctx.fillStyle = '#666666';
  ctx.font = '13px "Microsoft JhengHei", "Noto Sans TC", sans-serif';
  const displayName = file.name.length > 35 ? `${file.name.substring(0, 32)}...` : file.name;
  ctx.fillText(displayName, W / 2, H / 2 + 48);

  return toJpegBlob(canvas);
};

/**
 * 依副檔名選擇產生方式
 *
 * @param {File} file 使用者選擇的文件
 * @returns {Promise<File|null>} 縮圖 File（JPEG，檔名與原檔同名），無法產生時為 null
 */
export const generateDocumentThumbnail = async (file) => {
  if (!file) return null;
  const ext = file.name.split('.').pop().toLowerCase();

  try {
    let blob = null;
    if (ext === 'pdf') blob = await generatePdfThumbnail(file);
    else if (ext === 'docx') blob = await generateDocxThumbnail(file);
    else if (ext === 'doc') blob = await generatePlaceholderThumbnail(file, 'DOC');
    else if (ext === 'ppt' || ext === 'pptx') blob = await generatePlaceholderThumbnail(file, 'PPT');

    if (!blob) return null;

    // 包成 File，讓 FormData 能帶對檔名與 MIME
    const baseName = file.name.substring(0, file.name.lastIndexOf('.')) || file.name;
    return new File([blob], `${baseName}.jpg`, { type: 'image/jpeg' });
  } catch (error) {
    console.error('[縮圖] 生成失敗:', error);
    return null;
  }
};

export default generateDocumentThumbnail;
