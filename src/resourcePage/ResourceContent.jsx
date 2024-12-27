import React, { useState } from "react";
import "./ResourceContent.css";

import ResourceCard from "./ResourceCard";

const ResourceContent = ({ numberOfCards,renderCard,onCardClick  }) => {
  const defaultCard = {
    //imageUrl: "/src/assets/home/banner.png",
    imageUrl: "/src/assets/resourcepage/file_preview_demo.png",
    fileType: "PDF",
    likes: 100,
    downloads: 20,
    title: "112南一版四年級上學期國語課講義",
    uploader: "Wynnie",
    tags: ["國中", "真平", "上冊", "投影片"],
    date: "today",
  };

  const cards = Array.from({ length: numberOfCards  }, () => defaultCard);
  //const cards = fetchNewData() || Array.from({ length: 20 }, () => defaultCard);

  return (
    <div className="resource-content">
      {cards.map((card, index) =>
        renderCard ? renderCard(card, index) :(
          <ResourceCard
            key={index}
            {...card}
            onCardClick={onCardClick ? () => onCardClick(card) : undefined}
          />
        )
      )}
    </div>
  );
};

export default ResourceContent;
