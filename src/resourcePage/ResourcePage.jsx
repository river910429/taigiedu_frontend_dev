import React, { useState } from "react";
import "./ResourcePage.css";

import ResourceHeader from "./ResourceHeader";
import ResourceContent from "./ResourceContent";


const ResourcePage = () => {
  return (
    <div className="resource-page">
      <ResourceHeader />
      <ResourceContent />
    </div>
  );
};

export default ResourcePage;
