import { useState } from 'react';
import PropTypes from 'prop-types';
import ReportIssueModal from './ReportIssueModal';
import questionMarkIcon from '../../assets/question-mark.svg';
import './ReportIssue.css';

/**
 * 「回報問題」入口
 * 各頁面只要在內容區最後放一行 <ReportIssueLink pageKey="phrase" />，
 * 就會得到設計稿的提示連結與對應的回報彈窗，不必自己管開關狀態。
 */
const ReportIssueLink = ({ pageKey, label, detailOptions, className = '' }) => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <>
            <button
                type="button"
                className={`report-issue-link ${className}`.trim()}
                onClick={() => setIsOpen(true)}
            >
                <img src={questionMarkIcon} alt="" className="report-issue-link-icon" />
                <span>
                    如有任何問題，請點此 <span className="report-issue-link-action">回報問題</span>
                </span>
            </button>

            <ReportIssueModal
                isOpen={isOpen}
                onClose={() => setIsOpen(false)}
                pageKey={pageKey}
                label={label}
                detailOptions={detailOptions}
            />
        </>
    );
};

ReportIssueLink.propTypes = {
    /** reportIssueConfig 的頁面代碼，如 'phrase'、'exam' */
    pageKey: PropTypes.string.isRequired,
    label: PropTypes.string,
    detailOptions: PropTypes.arrayOf(PropTypes.string),
    className: PropTypes.string,
};

export default ReportIssueLink;
