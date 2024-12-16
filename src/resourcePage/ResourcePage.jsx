import React, { useState } from "react";
import "./ResourcePage.css";

import ResourceHeader from "./ResourceHeader";
import ResourceContent from "./ResourceContent";
import UploadResource from "./UploadResource";

const ResourcePage = () => {
  const [isUploadOpen, setIsUploadOpen] = useState(false); // 控制上傳頁面

  const handleUploadOpen = () => {
    setIsUploadOpen(true);
  };

  const handleUploadClose = () => {
    setIsUploadOpen(false);
  };

  return (
    <div className="resource-page">
      <ResourceHeader onUploadOpen={handleUploadOpen} />
      <ResourceContent />
      <UploadResource isOpen={isUploadOpen} onClose={handleUploadClose} />
    </div>
  );
};

export default ResourcePage;
