import { useState, useMemo, useRef } from 'react';
import { createColumnHelper } from '@tanstack/react-table';
import { useToast } from '../../../components/Toast';
import AdminDataTable from '../../../components/AdminDataTable';
import AdminModal from '../../../components/AdminModal';
import DatePicker from '../../../components/DatePicker';
import '../../../components/AdminDataTable/AdminDataTable.css';
import './adminAnnouncementPage.css';
import pencilIcon from '../../../assets/adminPage/pencil.svg';
import trashIcon from '../../../assets/adminPage/trash.svg';

const columnHelper = createColumnHelper();

const SHUTDOWN_TEMPLATE =
  '因本校校內停電，本站將於「網站關閉時間」暫時停止服務，敬請見諒。';

const STATUS_CLASS = {
  '已上架': 'ann-badge-green',
  '排程中': 'ann-badge-blue',
  '已下架': 'ann-badge-gray',
};

function pad2(n) { return String(n).padStart(2, '0'); }

function getToday() {
  const d = new Date();
  return `${d.getFullYear()}/${pad2(d.getMonth() + 1)}/${pad2(d.getDate())}`;
}

function getTomorrow() {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return `${d.getFullYear()}/${pad2(d.getMonth() + 1)}/${pad2(d.getDate())}`;
}

function getNowTime() {
  const d = new Date();
  return `${pad2(d.getHours())}:${pad2(d.getMinutes())}`;
}

function getNextWholeHour() {
  const d = new Date();
  d.setHours(d.getHours() + 1, 0, 0, 0);
  return `${pad2(d.getHours())}:00`;
}

function toISO(dateStr, timeStr) {
  if (!dateStr) return '';
  return `${dateStr.replace(/\//g, '-')}T${timeStr || '00:00'}:00`;
}

function parseISODate(isoStr) {
  if (!isoStr) return '';
  const d = new Date(isoStr);
  return `${d.getFullYear()}/${pad2(d.getMonth() + 1)}/${pad2(d.getDate())}`;
}

function parseISOTime(isoStr) {
  if (!isoStr) return '00:00';
  const d = new Date(isoStr);
  return `${pad2(d.getHours())}:${pad2(d.getMinutes())}`;
}

function formatDateTime(isoStr) {
  if (!isoStr) return '';
  const d = new Date(isoStr);
  return `${d.getFullYear()}/${pad2(d.getMonth() + 1)}/${pad2(d.getDate())} ${pad2(d.getHours())}:${pad2(d.getMinutes())}`;
}

function subtractDays(dateStr, days) {
  if (!dateStr) return '';
  const [y, m, dd] = dateStr.split('/').map(Number);
  const d = new Date(y, m - 1, dd);
  d.setDate(d.getDate() - days);
  return `${d.getFullYear()}/${pad2(d.getMonth() + 1)}/${pad2(d.getDate())}`;
}

const MOCK_DATA = [
  {
    id: 1,
    type: '一般公告',
    title: '網站功能更新通知',
    content: '本站已新增台語拼音搜尋功能，歡迎使用者多加利用。',
    startAt: '2026-06-01T08:00:00',
    endAt: '2026-06-30T23:59:00',
    shutdownStartAt: null,
    shutdownEndAt: null,
    status: '已上架',
    createdAt: '2026-05-28T10:30:00',
    createdBy: '全台老',
  },
  {
    id: 2,
    type: '一般公告',
    title: '新增親屬稱謂計算機',
    content: '台語親屬稱謂計算機正式上線，支援多種方言腔調查詢。',
    startAt: '2026-04-01T00:00:00',
    endAt: '2026-05-31T23:59:00',
    shutdownStartAt: null,
    shutdownEndAt: null,
    status: '已下架',
    createdAt: '2026-03-25T09:00:00',
    createdBy: '全台老',
  },
  {
    id: 3,
    type: '一般公告',
    title: '暑期台語文認證考試報名開始',
    content: '114 年度暑期台語文能力認證考試開放報名，報名截止日為 2026/07/15。',
    startAt: '2026-07-01T00:00:00',
    endAt: '2026-07-15T23:59:00',
    shutdownStartAt: null,
    shutdownEndAt: null,
    status: '排程中',
    createdAt: '2026-06-15T14:00:00',
    createdBy: '管理員',
  },
  {
    id: 4,
    type: '停機公告',
    title: null,
    content: SHUTDOWN_TEMPLATE,
    startAt: '2026-05-25T02:00:00',
    endAt: '2026-06-01T06:00:00',
    shutdownStartAt: '2026-06-01T02:00:00',
    shutdownEndAt: '2026-06-01T06:00:00',
    status: '已下架',
    createdAt: '2026-05-20T11:00:00',
    createdBy: '全台老',
  },
  {
    id: 5,
    type: '停機公告',
    title: null,
    content: SHUTDOWN_TEMPLATE,
    startAt: '2026-07-05T01:00:00',
    endAt: '2026-07-12T06:00:00',
    shutdownStartAt: '2026-07-12T01:00:00',
    shutdownEndAt: '2026-07-12T06:00:00',
    status: '排程中',
    createdAt: '2026-06-10T15:30:00',
    createdBy: '管理員',
  },
];

let nextId = 6;

const getInitialForm = () => ({
  type: '',
  generalStart: '', generalStartTime: '00:00',
  generalEnd: getTomorrow(), generalEndTime: getNextWholeHour(),
  title: '',
  content: '',
  shutdownStart: '', shutdownStartTime: '00:00',
  shutdownEnd: getTomorrow(), shutdownEndTime: getNextWholeHour(),
  shutdownContent: SHUTDOWN_TEMPLATE,
});

const AdminAnnouncementPage = () => {
  const { showToast } = useToast();
  const allDataRef = useRef([...MOCK_DATA]);

  const [statusFilter, setStatusFilter] = useState('目前項目');
  const [allData, setAllData] = useState([...MOCK_DATA]);

  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(getInitialForm());

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingItem, setDeletingItem] = useState(null);

  // ── 自動計算停機公告的公告時間 ──
  const autoStart = useMemo(() => subtractDays(form.shutdownStart, 7), [form.shutdownStart]);
  const autoEnd = form.shutdownEnd || form.shutdownStart;

  // ── 篩選後的資料 ──
  const announcements = useMemo(() => {
    return allData.filter(a => {
      if (statusFilter === '目前項目') return a.status === '已上架' || a.status === '排程中';
      if (statusFilter === '已下架') return a.status === '已下架';
      return true;
    });
  }, [allData, statusFilter]);

  // ── 開啟新增 Modal ──
  const openAdd = () => {
    setEditingId(null);
    setForm({
      ...getInitialForm(),
      type: '',
      shutdownContent: SHUTDOWN_TEMPLATE,
    });
    setShowModal(true);
  };

  // ── 開啟編輯 Modal ──
  const openEdit = (item) => {
    if (item.type === '停機公告') {
      setForm({
        type: '停機公告',
        generalStart: '', generalStartTime: '00:00',
        generalEnd: '', generalEndTime: '23:59',
        title: '',
        content: '',
        shutdownStart: parseISODate(item.shutdownStartAt),
        shutdownStartTime: parseISOTime(item.shutdownStartAt),
        shutdownEnd: parseISODate(item.shutdownEndAt),
        shutdownEndTime: parseISOTime(item.shutdownEndAt),
        shutdownContent: item.content || SHUTDOWN_TEMPLATE,
      });
    } else {
      setForm({
        type: '一般公告',
        generalStart: parseISODate(item.startAt),
        generalStartTime: parseISOTime(item.startAt),
        generalEnd: parseISODate(item.endAt),
        generalEndTime: parseISOTime(item.endAt),
        title: item.title || '',
        content: item.content || '',
        shutdownStart: '', shutdownStartTime: '00:00',
        shutdownEnd: '', shutdownEndTime: '00:00',
        shutdownContent: SHUTDOWN_TEMPLATE,
      });
    }
    setEditingId(item.id);
    setShowModal(true);
  };

  const setField = (key, val) => setForm(f => ({ ...f, [key]: val }));

  const handleStartDateChange = (field, endField, val) => {
    setForm(f => {
      const currentEnd = f[endField];
      const startTimeField = field + 'Time';
      const endTimeField = endField + 'Time';
      if (!currentEnd || currentEnd < val) {
        return { ...f, [field]: val, [endField]: val, [endTimeField]: f[startTimeField] };
      }
      if (currentEnd === val && f[endTimeField] <= f[startTimeField]) {
        return { ...f, [field]: val, [endTimeField]: f[startTimeField] };
      }
      return { ...f, [field]: val };
    });
  };

  // ── 表單驗證 ──
  const validateForm = () => {
    if (!form.type) { showToast('請選擇公告類型', 'warning'); return false; }
    const now = new Date();
    if (form.type === '一般公告') {
      if (!form.generalStart) { showToast('請選擇公告開始日期', 'warning'); return false; }
      if (!form.title.trim()) { showToast('請填寫公告標題', 'warning'); return false; }
      if (!form.content.trim()) { showToast('請填寫文字內容', 'warning'); return false; }
      const startISO = toISO(form.generalStart, form.generalStartTime);
      if (new Date(startISO) < now) { showToast('開始時間不可為過去時間', 'warning'); return false; }
      if (form.generalEnd) {
        const endISO = toISO(form.generalEnd, form.generalEndTime);
        if (endISO <= startISO) {
          showToast('結束時間必須晚於開始時間', 'warning'); return false;
        }
      }
    } else {
      if (!form.shutdownStart) { showToast('請選擇網站關閉開始時間', 'warning'); return false; }
      if (!form.shutdownContent.trim()) { showToast('請填寫預設文字內容', 'warning'); return false; }
      const startISO = toISO(form.shutdownStart, form.shutdownStartTime);
      if (new Date(startISO) < now) { showToast('關閉開始時間不可為過去時間', 'warning'); return false; }
      if (form.shutdownEnd) {
        const endISO = toISO(form.shutdownEnd, form.shutdownEndTime);
        if (endISO <= startISO) {
          showToast('關閉結束時間必須晚於開始時間', 'warning'); return false;
        }
      }
    }
    return true;
  };

  const calcStatus = (startISO, endISO) => {
    const nowDate = new Date();
    return nowDate > new Date(endISO) ? '已下架' : nowDate < new Date(startISO) ? '排程中' : '已上架';
  };

  // ── 送出表單（mock）──
  const handleSubmit = () => {
    if (!validateForm()) return;

    const now = new Date().toISOString();

    if (form.type === '一般公告') {
      const startAt = toISO(form.generalStart, form.generalStartTime);
      const endAt = toISO(form.generalEnd || form.generalStart, form.generalEndTime);
      const status = calcStatus(startAt, endAt);

      if (status === '已上架' && allData.some(a => a.status === '已上架' && a.id !== editingId)) {
        showToast('目前已有一則公告上架中，請先調整其結束時間', 'warning'); return;
      }

      if (editingId) {
        setAllData(prev => prev.map(a => a.id === editingId
          ? { ...a, title: form.title.trim(), content: form.content.trim(), startAt, endAt, status }
          : a
        ));
        showToast('公告已更新 ✓', 'success');
      } else {
        const newItem = {
          id: nextId++,
          type: '一般公告',
          title: form.title.trim(),
          content: form.content.trim(),
          startAt, endAt,
          shutdownStartAt: null, shutdownEndAt: null,
          status,
          createdAt: now,
          createdBy: '管理員',
        };
        setAllData(prev => [newItem, ...prev]);
        showToast('公告已新增 ✓', 'success');
      }
    } else {
      const shutdownStartAt = toISO(form.shutdownStart, form.shutdownStartTime);
      const shutdownEndAt = toISO(form.shutdownEnd || form.shutdownStart, form.shutdownEndTime);
      const autoStartAt = toISO(subtractDays(form.shutdownStart, 7), form.shutdownStartTime);
      const status = calcStatus(autoStartAt, shutdownEndAt);

      if (status === '已上架' && allData.some(a => a.status === '已上架' && a.id !== editingId)) {
        showToast('目前已有一則公告上架中，請先調整其結束時間', 'warning'); return;
      }

      if (editingId) {
        setAllData(prev => prev.map(a => a.id === editingId
          ? { ...a, content: form.shutdownContent.trim(), shutdownStartAt, shutdownEndAt, startAt: autoStartAt, endAt: shutdownEndAt, status }
          : a
        ));
        showToast('公告已更新 ✓', 'success');
      } else {
        const newItem = {
          id: nextId++,
          type: '停機公告',
          title: null,
          content: form.shutdownContent.trim(),
          startAt: autoStartAt,
          endAt: shutdownEndAt,
          shutdownStartAt,
          shutdownEndAt,
          status,
          createdAt: now,
          createdBy: '管理員',
        };
        setAllData(prev => [newItem, ...prev]);
        showToast('停機公告已新增 ✓', 'success');
      }
    }

    setShowModal(false);
  };

  // ── 刪除（mock）──
  const openDelete = (item) => {
    setDeletingItem(item);
    setShowDeleteModal(true);
  };

  const confirmDelete = () => {
    setAllData(prev => prev.filter(a => a.id !== deletingItem.id));
    showToast('公告已刪除', 'success');
    setShowDeleteModal(false);
    setDeletingItem(null);
  };

  // ── 欄位定義 ──
  const columns = useMemo(() => {
    const base = [
      columnHelper.display({
        id: 'edit',
        size: 44,
        enableSorting: false,
        header: () => null,
        cell: ({ row }) => (
          <button className="ann-icon-btn" onClick={() => openEdit(row.original)} title="編輯">
            <img src={pencilIcon} alt="編輯" className="ann-action-icon" />
          </button>
        ),
      }),
      columnHelper.accessor('status', {
        header: '目前狀態',
        size: 100,
        enableSorting: true,
        cell: info => (
          <span className={`ann-badge ${STATUS_CLASS[info.getValue()] || 'ann-badge-gray'}`}>
            {info.getValue()}
          </span>
        ),
      }),
      columnHelper.accessor('type', {
        header: '類型',
        size: 90,
        enableSorting: true,
        cell: info => info.getValue(),
      }),
      columnHelper.accessor('content', {
        header: '內容',
        enableSorting: false,
        cell: info => <span className="ann-trunc">{info.getValue()}</span>,
      }),
    ];

    base.push(
      columnHelper.accessor('startAt', {
        header: '公告開始時間',
        size: 150,
        enableSorting: true,
        cell: info => formatDateTime(info.getValue()),
      }),
      columnHelper.accessor('endAt', {
        header: '公告結束時間',
        size: 150,
        enableSorting: true,
        cell: info => formatDateTime(info.getValue()),
      }),
      columnHelper.accessor('createdAt', {
        header: '建立時間',
        size: 140,
        enableSorting: true,
        cell: info => formatDateTime(info.getValue()),
      }),
      columnHelper.accessor('createdBy', {
        header: '建立者',
        size: 90,
        enableSorting: true,
        cell: info => info.getValue(),
      }),
      columnHelper.display({
        id: 'delete',
        size: 44,
        enableSorting: false,
        header: () => null,
        cell: ({ row }) => (
          <button className="ann-icon-btn ann-icon-btn-danger" onClick={() => openDelete(row.original)} title="刪除"><img src={trashIcon} alt="刪除" className="ann-action-icon" /></button>
        ),
      })
    );

    return base;
  }, []);

  const breadcrumb = '網站維護 > 公告管理';
  const isShutdown = form.type === '停機公告';

  return (
    <div className="ann-page">
      <h5 className="ann-breadcrumb">{breadcrumb}</h5>

      {/* Toolbar */}
      <div className="ann-toolbar">
        <button className="ann-btn-add" onClick={openAdd}>＋ 新增公告</button>
        <div className="ann-filter">
          <label>目前狀態：</label>
          <div className="ann-select-wrap">
            <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
              <option value="目前項目">目前項目</option>
              <option value="已下架">已下架</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      <AdminDataTable
        data={announcements}
        columns={columns}
        enableSorting={true}
        enableDragging={false}
        isLoading={false}
        error={null}
        emptyState={{ message: '目前沒有公告' }}
      />

      {/* 新增/編輯 Modal */}
      <AdminModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={editingId ? '編輯公告' : '新增公告'}
        onSubmit={handleSubmit}
        submitText="送出"
        size="lg"
      >
        {/* 公告類型 */}
        <div className="mb-3">
          <label className="form-label admin-form-label">
            <span className="ann-required">*</span>公告類型
          </label>
          <select
            className="form-select admin-form-control ann-type-select"
            value={form.type}
            onChange={e => setForm(f => ({
              ...f,
              type: e.target.value,
              shutdownContent: e.target.value === '停機公告' ? SHUTDOWN_TEMPLATE : f.shutdownContent,
            }))}
          >
            <option value="">請選擇公告類型</option>
            <option value="一般公告">一般公告</option>
            <option value="停機公告">停機公告</option>
          </select>
        </div>

        {/* ── 一般公告欄位 ── */}
        {form.type === '一般公告' && (
          <>
            <div className="mb-3">
              <label className="form-label admin-form-label">
                <span className="ann-required">*</span>公告時間
              </label>
              <div className="ann-dt-row">
                <DatePicker
                  value={form.generalStart}
                  onChange={val => handleStartDateChange('generalStart', 'generalEnd', val)}
                  placeholder="選擇開始日期"
                  minDate={getToday()}
                />
                <input type="time" className="ann-time-input" value={form.generalStartTime}
                  min={form.generalStart === getToday() ? getNowTime() : undefined}
                  onChange={e => {
                    const t = e.target.value;
                    setForm(f => ({
                      ...f,
                      generalStartTime: t,
                      ...(f.generalEnd === f.generalStart && f.generalEndTime <= t ? { generalEndTime: t } : {}),
                    }));
                  }} />
                <span className="ann-arrow">→</span>
                <DatePicker
                  value={form.generalEnd}
                  onChange={val => setField('generalEnd', val)}
                  placeholder="選擇結束日期"
                  minDate={form.generalStart || getTomorrow()}
                />
                <input type="time" className="ann-time-input" value={form.generalEndTime}
                  min={form.generalEnd === form.generalStart ? form.generalStartTime : undefined}
                  onChange={e => setField('generalEndTime', e.target.value)} />
              </div>
            </div>

            <div className="mb-3">
              <label className="form-label admin-form-label">
                <span className="ann-required">*</span>公告標題
              </label>
              <input type="text" className="form-control admin-form-control"
                value={form.title} onChange={e => setField('title', e.target.value)}
                placeholder="請輸入公告標題" />
            </div>

            <div className="mb-3">
              <label className="form-label admin-form-label">
                <span className="ann-required">*</span>文字內容
              </label>
              <textarea className="form-control admin-form-control ann-textarea"
                value={form.content} onChange={e => setField('content', e.target.value)}
                placeholder="請輸入公告內容" rows={4} />
            </div>
          </>
        )}

        {/* ── 停機公告欄位 ── */}
        {isShutdown && (
          <>
            <div className="mb-3">
              <label className="form-label admin-form-label">
                公告時間（停機前 7 天開始自動公告）
              </label>
              <div className="ann-dt-row">
                <DatePicker value={autoStart || undefined} onChange={() => {}} disabled placeholder="自動計算" />
                <input type="time" className="ann-time-input ann-time-disabled" value={form.shutdownStartTime} disabled />
                <span className="ann-arrow">→</span>
                <DatePicker value={autoEnd || undefined} onChange={() => {}} disabled placeholder="自動計算" />
                <input type="time" className="ann-time-input ann-time-disabled" value={form.shutdownEndTime} disabled />
              </div>
              <div className="ann-auto-hint">系統將在網站關閉前 7 天自動開始顯示公告</div>
            </div>

            <div className="mb-3">
              <label className="form-label admin-form-label">
                <span className="ann-required">*</span>網站關閉時間
              </label>
              <div className="ann-dt-row">
                <DatePicker
                  value={form.shutdownStart}
                  onChange={val => handleStartDateChange('shutdownStart', 'shutdownEnd', val)}
                  placeholder="選擇關閉開始"
                  minDate={getToday()}
                />
                <input type="time" className="ann-time-input" value={form.shutdownStartTime}
                  min={form.shutdownStart === getToday() ? getNowTime() : undefined}
                  onChange={e => {
                    const t = e.target.value;
                    setForm(f => ({
                      ...f,
                      shutdownStartTime: t,
                      ...(f.shutdownEnd === f.shutdownStart && f.shutdownEndTime <= t ? { shutdownEndTime: t } : {}),
                    }));
                  }} />
                <span className="ann-arrow">→</span>
                <DatePicker
                  value={form.shutdownEnd}
                  onChange={val => setField('shutdownEnd', val)}
                  placeholder="選擇關閉結束"
                  minDate={form.shutdownStart || getTomorrow()}
                />
                <input type="time" className="ann-time-input" value={form.shutdownEndTime}
                  min={form.shutdownEnd === form.shutdownStart ? form.shutdownStartTime : undefined}
                  onChange={e => setField('shutdownEndTime', e.target.value)} />
              </div>
            </div>

            <div className="mb-3">
              <label className="form-label admin-form-label">
                <span className="ann-required">*</span>預設文字內容
              </label>
              <textarea className="form-control admin-form-control ann-textarea"
                value={form.shutdownContent} onChange={e => setField('shutdownContent', e.target.value)}
                rows={4} />
              <div className="ann-auto-hint">「網站關閉時間」將自動替換為實際的關閉時間區間</div>
            </div>
          </>
        )}
      </AdminModal>

      {/* 刪除確認 Modal */}
      {showDeleteModal && (
        <div className="ann-del-overlay" onClick={e => { if (e.target === e.currentTarget) { setShowDeleteModal(false); setDeletingItem(null); } }}>
          <div className="ann-del-modal">
            <div className="ann-del-title">確認刪除</div>
            <div className="ann-del-desc">
              確定要刪除這則公告嗎？<br />
              <small>{deletingItem?.title || '此公告'}</small><br /><br />
              此操作無法復原。
            </div>
            <div className="ann-del-actions">
              <button className="ann-del-cancel" onClick={() => { setShowDeleteModal(false); setDeletingItem(null); }}>取消</button>
              <button className="ann-del-confirm" onClick={confirmDelete}>刪除</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminAnnouncementPage;
