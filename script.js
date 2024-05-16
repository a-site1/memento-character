document.addEventListener('DOMContentLoaded', () => {
    const timedateElement = document.querySelector('.timedate');
    const tableBody = document.querySelector('#dataTable tbody');
    const loadingElement = document.querySelector('.loading');
    const loadDataButton = document.querySelector('#loadDataButton');
    const startRangeInput = document.querySelector('#startRange');
    const endRangeInput = document.querySelector('#endRange');
    const unlimitedCheckbox = document.querySelector('#unlimited');
    const characterSelect = document.querySelector('#characterSelect');

    // キャラクターIDと名前のマッピング
    const characterNames = {
        1: 'モニカ',
        2: 'イリア',
        3: 'アイリス',
        4: 'ロキ',
        5: 'ソルティーナ',
        6: 'アムレート',
        7: 'フェンリル',
        8: 'フローレンス',
        9: 'ソーニャ',
        10: 'モーザ',
        11: 'シャーロット',
        12: 'アリアンロッド',
        13: 'テオドラ',
        14: 'ペトラ',
        15: 'サブリナ',
        16: 'フレイシア',
        17: 'アモール',
        18: 'リーン',
        19: 'ベル',
        20: 'ディアン',
        21: 'シズ',
        22: 'ザラ',
        23: 'ロザリー',
        24: 'リブラ',
        25: 'アイビー',
        26: 'マーリン',
        27: 'コルディ',
        28: 'ニーナ',
        29: 'メルティーユ',
        30: 'ルーク',
        31: 'ガルム',
        32: 'スクルド',
        33: 'チェルナ',
        34: 'ソテイラ',
        35: 'ミミ',
        36: 'トロポン',
        37: 'ハトホル',
        38: 'オリヴィエ',
        39: 'プリマヴェーラ',
        40: 'カロル',
        41: 'ナターシャ',
        42: 'フォルティナ',
        43: 'ケルベロス',
        44: 'ルサールカ',
        45: 'エルフリンデ',
        46: 'ルナリンド',
        47: 'ヴァルリーデ',
        48: 'A.A.',
        49: 'オフィーリア',
        50: 'アームストロング',
        51: 'ソフィア',
        52: 'シヴィ',
        53: 'ウィーラ',
        54: 'シフォン',
        55: 'レア',
        56: 'クラウディア',
        57: 'ステラ',
        58: 'アーティ',
        59: 'エイル',
        60: 'フィアー',
        61: '[神呪]イリア',
        62: 'プリシラ',
        63: 'パラデア',
        64: 'ギルウィアル',
        65: '',
        66: '[黒鎧]アイリス',
        67: 'リシェス',
        68: 'フェーネ',
        69: '',
        70: '[夏]サブリナ',
        71: '[夏]モーザ',
        72: '[夏]コルディ',
        73: '[聖夜]アモール',
        74: '[聖夜]トロポン',
        75: 'モルガナ',
        76: 'ユニ',
        77: '',
        78: 'アサヒ',
        79: '',
        80: '',
        81: '',
        82: '',
        83: '',
        84: 'リズ',
        85: 'マチルダ',
        86: '',
        87: '',
        88: '[使徒]ロザリー',
        89: '',
        90: '',
        91: '',
        92: ''
    };

    // プルダウンリストオプション
    const populateCharacterSelect = () => {
        Object.entries(characterNames).forEach(([id, name]) => {
            if (name) { // 名前があるキャラクター追加
                const option = document.createElement('option');
                option.value = id;
                option.textContent = name;
                characterSelect.appendChild(option);
            }
        });
    };

    populateCharacterSelect();

    const fetchData = async (url, urlNumber) => {
        try {
            const maskedUrlNumber = '*' + urlNumber.toString().slice(1);
            loadingElement.textContent = `読み込み中... ワールド: ${maskedUrlNumber}`;
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`Failed to fetch data from URL ${urlNumber}`);
            }
            const jsonData = await response.json();
            loadingElement.textContent = '';
            return jsonData.data;
        } catch (error) {
            console.error(error);
            return [];
        }
    };

    const displayRankingTable = (characters) => {
        tableBody.innerHTML = '';  // テーブルクリア
        const sortedCharacters = characters.sort((a, b) => b.BattlePower - a.BattlePower); // バトルパワーで降順ソート
        sortedCharacters.slice(0, 100).forEach((character, index) => {
            const name = characterNames[character.CharacterId] || 'Unknown';
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${character.PlayerName}</td>
                <td>${index + 1 + "位" }</td>
                <td>${name}</td>
                <td>${character.BattlePower}</td>
                <td>${character.UrlNumber}</td>
            `;
            tableBody.appendChild(row);
        });
    };

    const updateAccessTime = () => {
        const currentTime = new Date();
        timedateElement.textContent = `Access Time: ${currentTime.toLocaleString()}`;
    };

    const padNumber = (num) => {
        const str = num.toString().padStart(3, '0'); 
        return `1${str}`; 
    };

    const loadData = async () => {
        updateAccessTime(); // Access Time更新
        const unlimited = unlimitedCheckbox.checked;
        let startRange = parseInt(startRangeInput.value);
        let endRange = parseInt(endRangeInput.value);

        if (!unlimited) {
            if (isNaN(startRange) || isNaN(endRange) || startRange > endRange) {
                alert('有効な範囲を入力してください。');
                return;
            }
        } else {
            startRange = 1;
            endRange = Infinity; 
        }

        const allCharacters = [];
        for (let num = startRange; num <= endRange; num++) {
            const urlNumber = padNumber(num);
            const url = `https://api.mentemori.icu/${urlNumber}/arena/latest`;
            const data = await fetchData(url, urlNumber);
            if (data.length === 0) {
                break;
            }
            data.forEach(entry => {
                const characters = entry.UserCharacterInfoList || [];
                allCharacters.push(...characters.map(character => ({
                    ...character,
                    PlayerName: entry.PlayerName,
                    UrlNumber: urlNumber
                })));
            });
        }
        const selectedCharacterId = characterSelect.value;
        const filteredCharacters = selectedCharacterId
            ? allCharacters.filter(character => character.CharacterId == selectedCharacterId)
            : allCharacters;
        displayRankingTable(filteredCharacters);
    };

    unlimitedCheckbox.addEventListener('change', () => {
        const disabled = unlimitedCheckbox.checked;
        startRangeInput.disabled = disabled;
        endRangeInput.disabled = disabled;
    });

    loadDataButton.addEventListener('click', loadData);

    // チェックボックスをデフォルトチェック
    unlimitedCheckbox.checked = true;
    startRangeInput.disabled = true;
    endRangeInput.disabled = true;
});
