import React from 'react';
import './PhraseResult.css';

const PhraseResult = () => {
    return (
        <div>
            <div className="row pt-0 px-0" id="phraseResult">
                <div className="col-6">
                    <a href="#" onClick={() => showDetail(1)}>
                        <div className="row shadow px-3 py-3 my-2 phaseCard cardContainer">
                            <div className="col-12 p-0 phaseTitle">歹竹出好筍，好竹出痀崙</div>
                        </div>
                    </a>
                    <a href="#" onClick={() => showDetail(1)}>
                        <div className="row shadow px-3 py-3 my-2 phaseCard cardContainer">
                            <div className="col-12 p-0 phaseTitle">仙人拍鼓有時錯，跤步踏差啥人無?</div>
                        </div>
                    </a>
                    <a href="#" onClick={() => showDetail(1)}>
                        <div className="row shadow px-3 py-3 my-2 phaseCard cardContainer">
                            <div className="col-12 p-0 phaseTitle">軟塗深掘</div>
                        </div>
                    </a>
                    <a href="#" onClick={() => showDetail(1)}>
                        <div className="row shadow px-3 py-3 my-2 phaseCard cardContainer">
                            <div className="col-12 p-0 phaseTitle">甘蔗無雙頭甜</div>
                        </div>
                    </a>
                    <a href="#" onClick={() => showDetail(1)}>
                        <div className="row shadow px-3 py-3 my-2 phaseCard cardContainer">
                            <div className="col-12 p-0 phaseTitle">有一好，無兩好</div>
                        </div>
                    </a>
                    <a href="#" onClick={() => showDetail(1)}>
                        <div className="row shadow px-3 py-3 my-2 phaseCard cardContainer">
                            <div className="col-12 p-0 phaseTitle">花媠袂芳，芳花袂媠</div>
                        </div>
                    </a>
                    <a href="#" onClick={() => showDetail(1)}>
                        <div className="row shadow px-3 py-3 my-2 phaseCard cardContainer">
                            <div className="col-12 p-0 phaseTitle">媠，媠無十全；䆀，䆀無交圇</div>
                        </div>
                    </a>
                    <a href="#" onClick={() => showDetail(1)}>
                        <div className="row shadow px-3 py-3 my-2 phaseCard cardContainer">
                            <div className="col-12 p-0 phaseTitle">生狂狗食無屎</div>
                        </div>
                    </a>
                </div>

                <div className="col-6">
                    <a href="#" onClick={() => showDetail(1)}>
                        <div className="row shadow px-3 py-3 my-2 phaseCard cardContainer">
                            <div className="col-12 p-0 phaseTitle">勤儉才有底，浪費不成家</div>
                        </div>
                    </a>
                    <a href="#" onClick={() => showDetail(1)}>
                        <div className="row shadow px-3 py-3 my-2 phaseCard cardContainer">
                            <div className="col-12 p-0 phaseTitle">會儉起樓堂，袂儉賣田園</div>
                        </div>
                    </a>
                    <a href="#" onClick={() => showDetail(1)}>
                        <div className="row shadow px-3 py-3 my-2 phaseCard cardContainer">
                            <div className="col-12 p-0 phaseTitle">儉穿得新，儉食得賰</div>
                        </div>
                    </a>
                    <a href="#" onClick={() => showDetail(1)}>
                        <div className="row shadow px-3 py-3 my-2 phaseCard cardContainer">
                            <div className="col-12 p-0 phaseTitle">鳥喙牛尻川</div>
                        </div>
                    </a>
                    <a href="#" onClick={() => showDetail(1)}>
                        <div className="row shadow px-3 py-3 my-2 phaseCard cardContainer">
                            <div className="col-12 p-0 phaseTitle">閹雞抾碎米，水牛落大屎</div>
                        </div>
                    </a>
                    <a href="#" onClick={() => showDetail(1)}>
                        <div className="row shadow px-3 py-3 my-2 phaseCard cardContainer">
                            <div className="col-12 p-0 phaseTitle">做雞做鳥討食，做水牛落屎</div>
                        </div>
                    </a>
                    <a href="#" onClick={() => showDetail(1)}>
                        <div className="row shadow px-3 py-3 my-2 phaseCard cardContainer">
                            <div className="col-12 p-0 phaseTitle">市內趁，庄跤食，三年就好額；庄跤趁，市內食，三年做乞食</div>
                        </div>
                    </a>
                    <a href="#" onClick={() => showDetail(1)}>
                        <div className="row shadow px-3 py-3 my-2 phaseCard cardContainer">
                            <div className="col-12 p-0 phaseTitle">一日掠魚，三日曝網</div>
                        </div>
                    </a>
                </div>
                <ul className="pagination">
        <li className="page-item"><a className="page-link wide-link" href="javascript:previousPage();">《 Back</a></li>
        <li className="page-item"><a className="page-link" href="javascript:changePage(8);">8</a></li>
        <li className="page-item"><a className="page-link" href="javascript:changePage(9);">9</a></li>
        <li className="page-item"><a className="page-link" href="javascript:changePage(10);">10</a></li>
        <li className="page-item"><a className="page-link" href="javascript:changePage(11);">11</a></li>
        <li className="page-item active" aria-current="page"><a className="page-link">12</a></li>
        <li className="page-item"><a className="page-link" href="javascript:changePage(13);">13</a></li>
        <li className="page-item"><a className="page-link" href="javascript:changePage(14);">14</a></li>
        <li className="page-item"><a className="page-link" href="javascript:changePage(15);">15</a></li>
        <li className="page-item"><a className="page-link" href="javascript:changePage(16);">16</a></li>
        <li className="page-item"><a className="page-link" href="javascript:changePage(17);">17</a></li>
        <li className="page-item"><a className="page-link wide-link" href="javascript:nextPage();">Next 》</a></li>
      </ul>
            </div>
        </div>
    );
};

export default PhraseResult;