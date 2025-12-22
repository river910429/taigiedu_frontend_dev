import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import './TermsPage.css';
import './styles/markdown.css';

const TermsPage = () => {
  const [content, setContent] = useState('');

  useEffect(() => {
    // 讀取 markdown 文件
    fetch('/docs/legal/terms-of-service.md')
      .then((response) => response.text())
      .then((text) => setContent(text))
      .catch((error) => console.error('Error loading terms of service:', error));
  }, []);

  return (
    <div className="terms-container">
      <div className="terms-content markdown-content">
        <ReactMarkdown>{content}</ReactMarkdown>
      </div>
    </div>
  );
};

export default TermsPage;
