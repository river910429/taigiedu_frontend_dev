import React, { useState } from 'react';
import './PhraseResult.css';
import PhraseModal from './PhraseModal';

const PhraseResult = () => {
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [selectedPhrase, setSelectedPhrase] = useState(null);

	const phrases = [
		{
			phrase: '歹竹出好筍，好竹出痀崙',
			pronunciation: 'Pháinn-tik tshut hó-sún, hó-tik tshut ku-lun',
			interpretation: '這是一段範例的解釋文字。這是一段範例的解釋文字。這是一段範例的解釋文字。這是一段範例的解釋文字。'
		},
		{
			phrase: '仙人拍鼓有時錯，跤步踏差啥人無?',
			pronunciation: 'Sian-jîn phah kóo iú sî tshò, kha-pōo ta̍h-tsha siánn-lâng bô?',
			interpretation: '這是一段範例的解釋文字。這是一段範例的解釋文字。這是一段範例的解釋文字。這是一段範例的解釋文字。'
		},
		{
			phrase: '軟塗深掘',
			pronunciation: 'Nńg-thôo tshim-ku̍t',
			interpretation: '這是一段範例的解釋文字。這是一段範例的解釋文字。這是一段範例的解釋文字。這是一段範例的解釋文字。'
		},
		{
			phrase: '甘蔗無雙頭甜',
			pronunciation: 'Kam-tsià bô siang-thâu tinn',
			interpretation: '這是一段範例的解釋文字。這是一段範例的解釋文字。這是一段範例的解釋文字。這是一段範例的解釋文字。'
		},
		{
			phrase: '有一好，無兩好',
			pronunciation: 'Ū tsi̍t hó, bô nn̄g hó',
			interpretation: '這是一段範例的解釋文字。這是一段範例的解釋文字。這是一段範例的解釋文字。這是一段範例的解釋文字。'
		},
		{
			phrase: '花媠袂芳，芳花袂媠',
			pronunciation: 'Hue súi bē phang, phang hue bē súi',
			interpretation: '這是一段範例的解釋文字。這是一段範例的解釋文字。這是一段範例的解釋文字。這是一段範例的解釋文字。'
		},
		{
			phrase: '媠，媠無十全；䆀，䆀無交圇',
			pronunciation: 'Súi, súi bô si̍p-tsân; bái, bái bô kau-lám',
			interpretation: '這是一段範例的解釋文字。這是一段範例的解釋文字。這是一段範例的解釋文字。這是一段範例的解釋文字。'
		},
		{
			phrase: '生狂狗食無屎',
			pronunciation: 'Senn kông káu tsia̍h bô sái',
			interpretation: '這是一段範例的解釋文字。這是一段範例的解釋文字。這是一段範例的解釋文字。這是一段範例的解釋文字。'
		},
		{
			phrase: '勤儉才有底，浪費不成家',
			pronunciation: 'Khîn-khiám tsiah ū té, lōng-huì put sîng ka',
			interpretation: '這是一段範例的解釋文字。這是一段範例的解釋文字。這是一段範例的解釋文字。這是一段範例的解釋文字。'
		},
		{
			phrase: '會儉起樓堂，袂儉賣田園',
			pronunciation: 'Ē khiām khí lâu-tn̂g, bē khiām bē tshân-hn̂g',
			interpretation: '這是一段範例的解釋文字。這是一段範例的解釋文字。這是一段範例的解釋文字。這是一段範例的解釋文字。'
		},
		{
			phrase: '儉穿得新，儉食得賰',
			pronunciation: 'Khiām tshīng tit sin, khiām tsia̍h tit tshun',
			interpretation: '這是一段範例的解釋文字。這是一段範例的解釋文字。這是一段範例的解釋文字。這是一段範例的解釋文字。'
		},
		{
			phrase: '鳥喙牛尻川',
			pronunciation: 'Tsiáu-tshuì gû-kha-tshng',
			interpretation: '這是一段範例的解釋文字。這是一段範例的解釋文字。這是一段範例的解釋文字。這是一段範例的解釋文字。'
		},
		{
			phrase: '閹雞抾碎米，水牛落大屎',
			pronunciation: 'Iam-ke khioh suì-bí, tsuí-gû lak tuā-sái',
			interpretation: '這是一段範例的解釋文字。這是一段範例的解釋文字。這是一段範例的解釋文字。這是一段範例的解釋文字。'
		},
		{
			phrase: '做雞做鳥討食，做水牛落屎',
			pronunciation: 'Tsò ke tsò tsiáu thó-tsia̍h, tsò tsuí-gû lak sái',
			interpretation: '這是一段範例的解釋文字。這是一段範例的解釋文字。這是一段範例的解釋文字。這是一段範例的解釋文字。'
		},
		{
			phrase: '市內趁，庄跤食，三年就好額；庄跤趁，市內食，三年做乞食',
			pronunciation: 'Tshī-lāi thàn, tsng-kha tsia̍h, sam-nî tō hó-gia̍h; tsng-kha thàn, tshī-lāi tsia̍h, sam-nî tsò khit-tsia̍h',
			interpretation: '這是一段範例的解釋文字。這是一段範例的解釋文字。這是一段範例的解釋文字。這是一段範例的解釋文字。'
		},
		{
			phrase: '一日掠魚，三日曝網',
			pronunciation: 'Tsi̍t-ji̍t lia̍h hî, sam-ji̍t pha̍k-bāng',
			interpretation: '這是一段範例的解釋文字。這是一段範例的解釋文字。這是一段範例的解釋文字。這是一段範例的解釋文字。'
		}
	];

	const leftPhrases = phrases.slice(0, Math.ceil(phrases.length / 2));
	const rightPhrases = phrases.slice(Math.ceil(phrases.length / 2));

	const showDetail = (phraseData) => {
		setSelectedPhrase(phraseData);
		setIsModalOpen(true);
	};


	const TOTAL_ITEMS = 200;
	const ITEMS_PER_PAGE = 16;
	const TOTAL_PAGES = Math.ceil(TOTAL_ITEMS / ITEMS_PER_PAGE);
	const VISIBLE_PAGES = 10;

	// Add pagination state
	const [currentPage, setCurrentPage] = useState(1);

	// Add pagination handlers
	const handlePageChange = (pageNumber) => {
		setCurrentPage(pageNumber);
	};

	const handlePreviousPage = () => {
		if (currentPage > 1) {
			setCurrentPage(prev => prev - 1);
		}
	};

	const handleNextPage = () => {
		if (currentPage < TOTAL_PAGES) {
			setCurrentPage(prev => prev + 1);
		}
	};

	// Add page number calculator
	const getPageNumbers = () => {
		let start = Math.max(1, currentPage - 4);
		let end = Math.min(TOTAL_PAGES, start + VISIBLE_PAGES - 1);

		if (end === TOTAL_PAGES) {
			start = Math.max(1, end - VISIBLE_PAGES + 1);
		}

		if (start === 1) {
			end = Math.min(TOTAL_PAGES, VISIBLE_PAGES);
		}

		return Array.from({ length: end - start + 1 }, (_, i) => start + i);
	};

	const previousPage = () => {
		// 實現上一頁邏輯
	};

	const nextPage = () => {
		// 實現下一頁邏輯
	};

	const changePage = (pageNumber) => {
		// 實現換頁邏輯
	};

	return (
		<div>
			<div className="row pt-0 px-0" id="phraseResult">
				<div className="col-6">
					{leftPhrases.map((phrase, index) => (
						<a key={index} href="#" onClick={() => showDetail(phrase)}>
							<div className="row px-3 py-3 my-2 phaseCard cardContainer">
								<div className="col-12 p-0 phaseTitle">{phrase.phrase}</div>
							</div>
						</a>
					))}
				</div>

				<div className="col-6">
					{rightPhrases.map((phrase, index) => (
						<a key={index} href="#" onClick={() => showDetail(phrase)}>
							<div className="row px-3 py-3 my-2 phaseCard cardContainer">
								<div className="col-12 p-0 phaseTitle">{phrase.phrase}</div>
							</div>
						</a>

					))}
				</div>

				<div className="pagination-container">
					<ul className="pagination">
						<li className="page-item back-button">
							<a className={`page-link wide-link ${currentPage <= 1 ? 'invisible' : ''}`}
								onClick={handlePreviousPage}>
								《 Back
							</a>
						</li>

						{getPageNumbers().map(number => (
							<li key={number}
								className={`page-item ${currentPage === number ? 'active' : ''}`}>
								<a className="page-link"
									onClick={() => handlePageChange(number)}>
									{number}
								</a>
							</li>
						))}

						<li className="page-item next-button">
							<a className={`page-link wide-link ${currentPage >= TOTAL_PAGES ? 'invisible' : ''}`}
								onClick={handleNextPage}>
								Next 》
							</a>
						</li>
					</ul>
				</div>
			</div>

			{selectedPhrase && (
				<PhraseModal
					isOpen={isModalOpen}
					onClose={() => setIsModalOpen(false)}
					phrase={selectedPhrase.phrase}
					pronunciation={selectedPhrase.pronunciation}
					interpretation={selectedPhrase.interpretation}
				/>
			)}
		</div>
	);
};

export default PhraseResult;