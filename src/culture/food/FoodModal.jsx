import React from 'react';
import './FoodModal.css';

const FoodModal = ({ isOpen, onClose, food }) => {
    if (!isOpen || !food) return null;

    return (
        <div className="food-modal-overlay">
            <div className="food-modal-container">
                <div className="food-modal-content">
                    <div className="food-modal-close">
                        <div className="food-close-button" onClick={onClose}>&times;</div>
                    </div>
                    <div className="food-modal-detail">
                        <div className="food-modal-header">
                            <div className="food-header-container">
                                <div className="food-image-container">
                                    <img src={food.image} alt={food.name} className="food-modal-image" />
                                </div>
                                <div className="food-header-content">
                                    <h2 className="food-modal-title">{food.name}</h2>
                                    <div className="food-pronunciation-container">
                                        <div className="food-pronunciation-text">{food.pron}</div>
                                        <div className="food-play-button">
                                            <img src="/src/assets/megaphone.svg" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="food-modal-body">
                            <div className="food-row-container">
                                <div className="food-interpretation-container">
                                    <span className="food-interpretation-label">釋義</span>
                                    <div className="food-interpretation-text">
                                        {food.intro}
                                    </div>
                                </div>
                            </div>

                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FoodModal; 