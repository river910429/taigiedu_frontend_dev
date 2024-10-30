import React, { useState } from 'react';
import "./TranscriptPage.css";

import TranscriptHeader from "./TranscriptHeader";
import TranscriptContent from "./TranscriptContent";

// 模擬逐字稿資料
const transcripts = [
  { speaker: "講者一", text: "這是一段台語逐字稿的示範。" },
  { speaker: "講者二", text: "這裡是另一段對話。" },
  { speaker: "講者三", text: "這是一段更長的台語對話逐字稿範例。" },
];

const TranscriptPage = () => {
  return (
    <div className="transcript-page">
      <TranscriptHeader />
      <TranscriptContent />
    </div>
  );
};

  
  export default TranscriptPage;