import React, { useState, useEffect } from "react";
import "./DeleteResource.css";
import ResourceContent from "./ResourceContent";
import ResourceCard from "./ResourceCard";
import ConfirmDialog from "./ConfirmDialog";
import { useNavigate } from "react-router-dom";
import { useToast } from "../components/Toast";
import deleteIcon from "../assets/resourcepage/delete-icon.svg";
import arrowLeftCircle from "../assets/resourcepage/arrow-left-circle.svg";
import emptyBox from "../assets/resourcepage/empty-box.svg";

const DeleteResource = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedResource, setSelectedResource] = useState(null);
  const [userId, setUserId] = useState(null);
  const [hasUserResources, setHasUserResources] = useState(null); // 使用三態值: null(未知), true(有), false(無)

  // 組件掛載時檢查登入狀態
  useEffect(() => {
    // 檢查用戶是否登入
    const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";
    const currentUserId = localStorage.getItem("userId");

    if (!isLoggedIn || !currentUserId) {
      showToast("您需要登入才能查看自己的資源", "warning");
      navigate("/login", { state: { redirectTo: "/delete-resource" } });
      return;
    }

    setUserId(currentUserId);
  }, []);

  // 自定義渲染卡片邏輯 - 保留與您原始代碼相同的接口
  const renderCard = (card, index) => {
    // 這裡假設 card 是資源對象，檢查 uploader_id 是否匹配當前用戶
    const currentUserId = localStorage.getItem("userId");
    
    // 如果卡片沒有 uploader_id 或與用戶 ID 不匹配，則不顯示
    if (!card.uploader_id || card.uploader_id.toString() !== currentUserId) {
      return null;
    }
    
    // 標記用戶有資源
    if (hasUserResources === null) {
      setHasUserResources(true);
    }
    
    return (
      <div key={index} className="delete-card-wrapper">
        <ResourceCard 
          imageUrl={card.imageUrl || "/src/assets/resourcepage/file_preview_demo.png"}
          fileType={card.fileType || "PDF"}
          likes={card.likes || 0}
          downloads={card.downloads || 0}
          title={card.title || "無標題資源"}
          uploader={card.uploader_name || "匿名上傳者"}
          tags={card.tags || []}
          date={card.date || ""}
          onCardClick={null} // 關閉跳轉
        />
        <div className="delete-overlay"></div>
        <button className="delete-button" onClick={() => handleDeleteDialog(card)}>
          <img
            src={deleteIcon}
            alt="Delete"
            className="delete-icon"
          />
          <span>刪除</span>
        </button>
      </div>
    );
  };

  // 檢查用戶是否有資源的函數，這會在 ResourceContent 載入完成後被調用
  const checkUserResources = (resources) => {
    if (!resources || resources.length === 0) {
      // 資源列表為空
      setHasUserResources(false);
      return;
    }
    
    const currentUserId = localStorage.getItem("userId");
    const hasMatchingResource = resources.some(
      resource => resource.uploader_id && resource.uploader_id.toString() === currentUserId
    );
    
    setHasUserResources(hasMatchingResource);
  };

  // 顯示確認刪除對話框
  const handleDeleteDialog = (resource) => {
    setSelectedResource(resource);
    setIsDialogOpen(true);
  };


// 確認刪除資源
// const handleConfirm = () => {
//   if (!selectedResource || !selectedResource.id) {
//     showToast("無法識別要刪除的資源", "error");
//     console.error("無法識別要刪除的資源", selectedResource);
//     setIsDialogOpen(false);
//     return;
//   }

//   // 確保在控制台顯示所選資源信息
//   console.log("正在刪除的資源:", selectedResource);

//   // 獲取用戶名稱
//   const username = localStorage.getItem("username") || selectedResource.uploader_name || "使用者";
  
//   // 準備刪除請求參數
//   const parameters = {
//     resourceId: parseInt(selectedResource.id, 10),
//     username: username
//   };

//   console.log("發送刪除請求參數:", parameters);
//   console.log("API URL:", "https://dev.taigiedu.com/backend/api/resource/delete");

//   // 使用 fetch API 替代 XMLHttpRequest
//   fetch("https://dev.taigiedu.com/backend/api/resource/delete", {
//     method: "POST",
//     headers: {
//       "Content-Type": "application/json"
//     },
//     body: JSON.stringify(parameters)
//   })
//   .then(response => {
//     console.log("收到API回應:", response.status, response.statusText);
    
//     // 返回原始文本以便檢查回應內容
//     return response.text();
//   })
//   .then(text => {
//     console.log("API回應文本:", text);
    
//     // 嘗試解析 JSON
//     try {
//       const response = JSON.parse(text);
//       console.log("解析後的回應:", response);
      
//       if (response.status === "success") {
//         console.log("刪除成功");
//         // alert("資源已成功刪除");  // 使用 alert 確保訊息顯示
//         showToast("資源已成功刪除", "success");
        
//         // 刪除成功後重新載入頁面
//         setTimeout(() => {
//           window.location.reload();
//         }, 1000);
//       } else {
//         console.error("刪除失敗", response);
//         // alert("刪除資源失敗: " + (response.message || "未知錯誤"));
//         showToast("刪除資源失敗: " + (response.message || "未知錯誤"), "error");
//       }
//     } catch (e) {
//       console.error("解析回應失敗:", e, text);
//       // alert("無法解析伺服器回應");
//       showToast("無法解析伺服器回應", "error");
//     }
//   })
//   .catch(error => {
//     console.error("網絡錯誤:", error);
//     // alert("網絡連接錯誤: " + error.message);
//     showToast("網絡連接錯誤", "error");
//   })
//   .finally(() => {
//     setIsDialogOpen(false);
//   });
// };
// 確認刪除資源
// 確認刪除資源
const handleConfirm = () => {
  if (!selectedResource || !selectedResource.id) {
    showToast("無法識別要刪除的資源", "error");
    console.error("無法識別要刪除的資源", selectedResource);
    setIsDialogOpen(false);
    return;
  }

  // 確保在控制台顯示所選資源信息
  console.log("正在刪除的資源:", selectedResource);

  // 獲取用戶ID (而不是用戶名稱)
  const userId = localStorage.getItem("userId");
  console.log("用戶ID:", userId);
  
  // 修正參數結構 - 使用 userId 而不是 username
  const parameters = {
    resourceId: parseInt(selectedResource.id, 10),
    userId: parseInt(userId, 10)  // 確保 userId 也是整數
  };

  console.log("發送刪除請求參數:", parameters);
  console.log("API URL:", "https://dev.taigiedu.com/backend/api/resource/delete");

  // 添加本地調試提示
  document.body.insertAdjacentHTML('beforeend', `
    <div id="debug-message" style="
      position: fixed;
      top: 10px;
      right: 10px;
      background: #333;
      color: white;
      padding: 10px;
      border-radius: 5px;
      z-index: 10000;
      max-width: 80%;
      overflow: auto;
      max-height: 80vh;
    ">
      <h3>刪除請求調試信息</h3>
      <p>資源ID: ${parameters.resourceId}</p>
      <p>用戶ID: ${parameters.userId}</p>
      <div id="debug-response">發送請求中...</div>
    </div>
  `);

  // 使用 fetch API 發送刪除請求
  fetch("https://dev.taigiedu.com/backend/api/resource/delete", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(parameters)
  })
  .then(response => {
    console.log("收到API回應:", response.status, response.statusText);
    document.getElementById('debug-response').innerHTML += `<p>回應狀態: ${response.status} ${response.statusText}</p>`;
    
    // 返回原始文本以便檢查回應內容
    return response.text();
  })
  .then(text => {
    console.log("API回應文本:", text);
    document.getElementById('debug-response').innerHTML += `<p>回應內容: ${text}</p>`;
    
    // 嘗試解析 JSON
    try {
      const response = JSON.parse(text);
      console.log("解析後的回應:", response);
      
      document.getElementById('debug-response').innerHTML += `<p>解析結果: ${JSON.stringify(response)}</p>`;
      
      if (response.status === "success") {
        console.log("刪除成功");
        showToast("資源已成功刪除", "success");
        document.getElementById('debug-response').innerHTML += `<p style="color: green">刪除成功!</p>`;
        
        // 延遲重新載入頁面，給足夠時間查看日誌
        document.getElementById('debug-response').innerHTML += `<p>頁面將在10秒後重新載入...</p>`;
        document.getElementById('debug-response').innerHTML += `<button onclick="window.location.reload()" style="padding: 5px; margin-top: 10px;">立即重新載入</button>`;
        
        setTimeout(() => {
          window.location.reload();
        }, 10000); // 10秒後重新載入
      } else {
        console.error("刪除失敗", response);
        showToast("刪除資源失敗: " + (response.message || "未知錯誤"), "error");
        document.getElementById('debug-response').innerHTML += `<p style="color: red">刪除失敗: ${response.message || "未知錯誤"}</p>`;
      }
    } catch (e) {
      console.error("解析回應失敗:", e, text);
      showToast("無法解析伺服器回應", "error");
      document.getElementById('debug-response').innerHTML += `<p style="color: red">解析錯誤: ${e.message}</p>`;
    }
  })
  .catch(error => {
    console.error("網絡錯誤:", error);
    showToast("網絡連接錯誤", "error");
    document.getElementById('debug-response').innerHTML += `<p style="color: red">網絡錯誤: ${error.message}</p>`;
  })
  .finally(() => {
    setIsDialogOpen(false);
    // 添加關閉調試視窗的按鈕
    document.getElementById('debug-message').innerHTML += `
      <button onclick="this.parentNode.remove()" style="margin-top: 10px; padding: 5px;">
        關閉此視窗
      </button>
    `;
  });
};

  // 取消刪除
  const handleCancel = () => {
    setIsDialogOpen(false);
  };

  // 前往上傳資源頁面
  const handleUploadResource = () => {
    navigate("/resource");
  };

  return (
    <div className="delete-resource-page">
      <button className="delete-back-button" onClick={() => navigate("/resource")}>
        <img
          src={arrowLeftCircle}
          alt="Back"
          className="back-icon"
        />
        <span className="back-text">回到前頁</span>
      </button>

      <div className="file-separator">&nbsp;</div>
      <div className="delete-resource-title">我的已上傳資源</div>

      {/* 顯示用戶無資源時的提示 */}
      {hasUserResources === false && (
        <div className="no-resources-container">
          <div className="no-resources-message">
            {/* <img 
              src={emptyBox}
              alt="No Resources" 
              className="no-resources-icon"
            /> */}
            <h3>您尚未上傳任何資源</h3>
            <p>上傳資源來分享您的知識吧！</p>
            <button 
              className="upload-resource-button"
              onClick={handleUploadResource}
            >
              去上傳資源
            </button>
          </div>
        </div>
      )}

      {/* 只有在用戶有資源或尚未確定時才顯示 ResourceContent */}
      {hasUserResources !== false && (
        <ResourceContent 
          searchParams={{
            stage: "",
            version: "",
            keyword: "",
            searchContent: ""
          }}
          onCardClick={null} // 不需要點擊事件
          renderCard={renderCard} // 傳入自定義渲染函數
          onResourcesLoaded={(resources) => checkUserResources(resources)} // 新增這個回調
        />
      )}

      {/* 確認對話框 */}
      <ConfirmDialog
        isOpen={isDialogOpen}
        onConfirm={handleConfirm}
        onCancel={handleCancel}
        fileName={selectedResource?.title || ""}
      />
    </div>
  );
};

export default DeleteResource;