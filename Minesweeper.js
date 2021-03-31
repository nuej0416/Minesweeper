// 지뢰 찾기

let dataset = [];
let tbody = document.querySelector('#table tbody');

let exitFlag = false;
let open = 0;

let codeTable = {
    openCell : -1,
    questionMark : -2,
    flag : -3,
    flagMine : -4,
    questionMine : -5,
    Mine : 1,
    commonCell : 0,
};

document.querySelector('#exec').addEventListener('click', function() {
    //내부 먼저 초기화
    tbody.innerHTML = '';
    document.querySelector('#result').textContent = '';
    dataset = [];
    open = 0;
    exitFlag = false;
    let hor = parseInt(document.querySelector('#hor').value);
    let ver = parseInt(document.querySelector('#ver').value);
    let mine = parseInt(document.querySelector('#mine').value);

    //지뢰 위치 뽑기
    let mines = Array(hor * ver)
    .fill()
    .map(function (el, index) {
        return index;
    });
    let shuffle = [];
    

    while (mines.length > hor * ver - mine) {
        let newMine = mines.splice(Math.floor(Math.random() * mines.length), 1)[0];
        shuffle.push(newMine);
    }

    // 지뢰 테이블 만들기
    for (let i = 0; i < ver; i += 1) {
        let arr = [];
        let tr = document.createElement('tr');
        dataset.push(arr);
        for (let j = 0; j < hor; j += 1) {
            arr.push(codeTable.commonCell);
            let td = document.createElement('td');

            // 오른쪽 클릭했을 때
            td.addEventListener('contextmenu', function (e) {
                e.preventDefault();
                if (exitFlag) {
                    return;
                }
                let parentTr = e.currentTarget.parentNode;
                let parentTbody = e.currentTarget.parentNode.parentNode;
                let cell = Array.prototype.indexOf.call(parentTr.children, e.currentTarget);
                let line = Array.prototype.indexOf.call(parentTbody.children, parentTr);

                if (dataset[line][cell] === codeTable.openCell) { // 이미 연 칸은 오른쪽 눌러도 효과 X
                    return;
                }
                if (e.currentTarget.textContent === '' || e.currentTarget.textContent === 'X') {
                    e.currentTarget.textContent = '!';
                    e.currentTarget.classList.add('flag');
                    if (dataset[line][cell] === codeTable.mine) {
                        dataset[line][cell] = codeTable.flagMine;
                    } else {
                        dataset[line][cell] = codeTable.flag;
                    }
                } else if (e.currentTarget.textContent === '!') {
                    e.currentTarget.textContent = '?';
                    e.currentTarget.classList.remove('flag');
                    e.currentTarget.classList.add('question');
                    if (dataset[line][cell] === codeTable.flagMine) {
                        dataset[line][cell] = codeTable.questionMine;
                    } else {
                        dataset[line][cell] = codeTable.questionMark;
                    }
                } else if (e.currentTarget.textContent === '?') {
                    e.currentTarget.classList.remove('question');
                    if (dataset[line][cell] === codeTable.questionMine) {
                        e.currentTarget.textContent = 'X';
                        dataset[line][cell] = codeTable.mine;
                    } else {
                        e.currentTarget.textContent = '';
                        dataset[line][cell] = codeTable.commonCell;
                    }
                } 
            });

            // 그냥 클릭했을 때
            td.addEventListener('click', function (e) {
                if (exitFlag) {
                    return;
                }
                
                let parentTr = e.currentTarget.parentNode;
                let parentTbody = e.currentTarget.parentNode.parentNode;
                let cell = Array.prototype.indexOf.call(parentTr.children, e.currentTarget);
                let line = Array.prototype.indexOf.call(parentTbody.children, parentTr);

                if ([codeTable.openCell, codeTable.flag, codeTable.flagMine, codeTable.questionMine, codeTable.questionMark].includes(dataset[line][cell])) {
                    return;
                }

                e.currentTarget.classList.add('opened');
                open += 1;
                
                if (dataset[line][cell] === codeTable.mine) { // 지뢰 클릭했을 때
                    e.currentTarget.textContent = '펑!';
                    document.querySelector('#result').textContent = '실패ㅠㅠ';
                    exitFlag = true;
                } else { // 지뢰가 아닌경우 주변 지뢰 개수
                    let around = [
                        dataset[line][cell - 1], dataset[line][cell + 1],
                    ];
                    if (dataset[line - 1]) {
                        around = around.concat([dataset[line - 1][cell - 1],dataset[line - 1][cell], dataset[line - 1][cell + 1]]);
                    }
                    if (dataset[line + 1]) {
                        around = around.concat([dataset[line + 1][cell - 1],dataset[line + 1][cell],dataset[line + 1][cell + 1]]);
                    }

                    let aroundMine = around.filter( function (v) {
                        return [codeTable.mine, codeTable.flagMine, codeTable.questionMine].includes(v);
                    }).length;

                    //거짓인 값 : false, '', 0, null, undefined, NaN
                    e.currentTarget.textContent = aroundMine || '';
                    dataset[line][cell] = codeTable.openCell;
                    if (aroundMine === 0) {
                        let aroundCell = [];
                        if (tbody.children[line - 1]) {
                            aroundCell = aroundCell.concat([
                                tbody.children[line - 1].children[cell - 1],
                                tbody.children[line - 1].children[cell],
                                tbody.children[line - 1].children[cell + 1],
                            ]);
                        }
                        aroundCell = aroundCell.concat([
                            tbody.children[line].children[cell - 1],
                            tbody.children[line].children[cell + 1],
                        ]);

                        if (tbody.children[line + 1]) {
                            aroundCell = aroundCell.concat([
                                tbody.children[line + 1].children[cell - 1],
                                tbody.children[line + 1].children[cell],
                                tbody.children[line + 1].children[cell + 1],
                            ]);
                        }
                        aroundCell.filter(function (v) {
                            return !!v;
                        }).forEach(function (nCell) {
                            let parentTr = nCell.parentNode;
                            let parentTbody = nCell.parentNode.parentNode;
                            let nCellCell = Array.prototype.indexOf.call(parentTr.children, nCell);
                            let nCellLine = Array.prototype.indexOf.call(parentTbody.children, parentTr);

                            if (dataset[nCellLine][nCellCell] !== codeTable.openCell) {
                                nCell.click();
                            }
                        });
                    }
                    
                }

                if( open === hor * ver - mine) {
                    exitFlag = true;
                    document.querySelector('#result').textContent = '승리~!!';
                }
            });
            tr.appendChild(td);
        }
        tbody.appendChild(tr);
    }

    //지뢰 심기

    for (let k = 0; k < shuffle.length; k += 1) {
        let sero = Math.floor (shuffle[k] / ver);
        let garo = shuffle[k] % ver;
        tbody.children[sero].children[garo].textContent = 'X';
        dataset[sero][garo] = codeTable.mine;
    }
});