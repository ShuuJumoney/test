document.addEventListener("DOMContentLoaded", function () {
	// URL 변경 후 버전
	getErinTime(document.getElementById("erinTime"));
	const locations = {
		"상인 네루": "티르코네일", "상인 누누": "던바튼", "상인 메루": "이멘마하", "상인 라누": "반호르", "상인 베루": "탈틴", "상인 에루": "타라",
		"상인 아루": "카브", "상인 피루": "벨바스트", "상인 세누": "스카하", "테일로": "켈라", "켄": "필리아", "리나": "코르", "카디": "발레스", 
		"귀넥": "카루", "얼리": "오아시스", "모락": "칼리다", "데위": "페라(자르딘)"
	};

	const setDefinitions = {
		    작물셋: ["튼튼한 달걀 주머니", "튼튼한 감자 주머니", "튼튼한 옥수수 주머니", "튼튼한 밀 주머니", "튼튼한 보리 주머니"],
		    방직셋: ["튼튼한 양털 주머니", "튼튼한 거미줄 주머니", "튼튼한 가는 실뭉치 주머니", "튼튼한 굵은 실뭉치 주머니"],
		    가죽셋: ["튼튼한 저가형 가죽 주머니", "튼튼한 일반 가죽 주머니", "튼튼한 고급 가죽 주머니", "튼튼한 최고급 가죽 주머니"],
		    옷감셋: ["튼튼한 저가형 옷감 주머니", "튼튼한 일반 옷감 주머니", "튼튼한 고급 옷감 주머니", "튼튼한 최고급 옷감 주머니"],
		    실크셋: ["튼튼한 저가형 실크 주머니", "튼튼한 일반 실크 주머니", "튼튼한 고급 실크 주머니", "튼튼한 최고급 실크 주머니", "튼튼한 꽃바구니"]
		};
	
	const orderedSetDefinitions = [
	    "작물셋", "방직셋", "유사 방직", 
	    "가죽셋", "옷감셋", "실크셋", "실크셋+", "꽃바구니"
	];
	
	let pouchOrder = [];
	let completeCnt = 0;
	let maxCompleteCnt = 0;
	let isDisplaying = false; // 중복 호출 방지 플래그
		

	const server_ch = { "류트": 42, "하프": 24, "울프": 15, "만돌린": 15 };
	//전서버 전지역 채널링 호출 횟수 (41 + 23 + 14 + 14) × 18 = 1656회
	//한 지역 채널링 41 + 23 + 14 + 14 = 92회

	const jumoney_key2 = {
	  "튼튼한 달걀 주머니": "5110005",
	  "튼튼한 감자 주머니": "5110006",
	  "튼튼한 옥수수 주머니": "5110007",
	  "튼튼한 밀 주머니" : "5110008",
	  "튼튼한 보리 주머니" : "5110009",
	  "튼튼한 양털 주머니": "5110010",
	  "튼튼한 거미줄 주머니": "2041",
	  "튼튼한 가는 실뭉치 주머니" : "2042",
	  "튼튼한 굵은 실뭉치 주머니" : "2043",
	  "튼튼한 저가형 가죽 주머니" : "5110014",
	  "튼튼한 일반 가죽 주머니" : "5110015",
	  "튼튼한 고급 가죽 주머니" : "5110016",
	  "튼튼한 최고급 가죽 주머니" : "5110017",
	  "튼튼한 저가형 옷감 주머니" : "5110018",
	  "튼튼한 일반 옷감 주머니" : "5110019",
	  "튼튼한 고급 옷감 주머니" : "5110020",
	  "튼튼한 최고급 옷감 주머니" : "5110021",
	  "튼튼한 저가형 실크 주머니" : "5110022",
	  "튼튼한 일반 실크 주머니" : "5110023",
	  "튼튼한 고급 실크 주머니" : "5110024",
	  "튼튼한 최고급 실크 주머니" : "5110025",
	  "튼튼한 꽃바구니" : "5110044",
	};
	
	let dataCache = {};
	let nextResetTime = null;  // 전역 리셋 시간
	let API_KEY = "";
	let SHARE_KEY = false;
	let imageCache = new Map();
	
	let lastRequestTime = 0; // 마지막 요청 시간 추적
	let requestCount = 0; // 현재 초의 호출 횟수
	let inProgressCalls = new Set(); // 진행 중인 호출을 저장
	let isCheckingServers = false; // 진행 상태 플래그
	
	async function throttle() {
	  const now = Date.now();

	  // 호출 간 최소 0.22초(220ms) 경과 여부 확인
	  const elapsed = now - lastRequestTime;
	  const waitTime = 250 - elapsed;
	
	  if (waitTime > 0) {
	    console.log(`대기 중: ${waitTime}ms`);
	    document.getElementById("curCallState").innerText = `대기 중: ${waitTime}ms`;
	    await new Promise((resolve) => setTimeout(resolve, waitTime));
	  }
	
	  // 호출 이후 시간 갱신
	  lastRequestTime = Date.now();
	
	  // 호출 횟수 증가 및 5회 초과 시 0.75초 대기
	  requestCount++;
	  if (requestCount >= 5) {
	    console.log(`5회 호출 완료. 755ms 대기 중...`);
	    document.getElementById("curCallState").innerText = `5회 호출 완료. 755ms 대기 중...`;
	    await new Promise((resolve) => setTimeout(resolve, 755));
	    requestCount = 0; // 호출 횟수 초기화
	  }
	}
	
	// 초기 설정
	//getNpcData();
	
	const localApiKey = localStorage.getItem("apiKey");		
	const localServer = localStorage.getItem("server");
	const localChannel = localStorage.getItem("channel");
	const localNpc = localStorage.getItem("npc");
	
	if (localServer) 
	  document.getElementById("server").value = localServer;
	
	if (localChannel)
	  document.getElementById("ch").value = localChannel;
	
	if (localNpc)
	  document.getElementById("npc_nm").value = localNpc;
	  
	// 체크박스의 상태가 변경될 때 SHARE_KEY 값을 변경합니다.
	/*
	const checkbox = document.getElementById('shareKey');

	checkbox.addEventListener('change', function() {
		if (checkbox.checked) {
			SHARE_KEY = true;  // 체크되면 true
			console.log('공용키 사용 활성화: ', SHARE_KEY);
		} else {
			SHARE_KEY = false;  // 체크 해제하면 false
			console.log('공용키 사용 비활성화: ', SHARE_KEY);
		}
	});	  
	*/
	
	setChannel(); //localServer 설정 한 후에		
	prevNextCh();
	prevNextLocation();
	
	//초기 리스트 바로 생성을 막기 위해 setChannel 이후 앱키 설정
	if (localApiKey) {
	  document.getElementById("apiKey").value = localApiKey;
	  API_KEY = localApiKey;
	}

	function getLocatioin() {
		const npc_nm = document.getElementById("npc_nm").value;
		return npc_nm === "all" ? Object.keys(locations) : [npc_nm];
	}

	function setChannel() {
		const chSelect = document.getElementById("ch");
		const serverSelect = document.getElementById("server").value;
		const maxCh = server_ch[serverSelect];
		maxCompleteCnt = maxCh - 1; //11채 제외

		chSelect.innerHTML = "";
		
		for (let i = 1; i <= maxCh; i++) {
			if (i === 11) continue;
			let option = document.createElement('option');
			option.value = i;
			option.text = `${i}채`;
			chSelect.appendChild(option);
		}
				
		if(API_KEY != "" || SHARE_KEY) chSelect.dispatchEvent(new Event('change'));
	}

	async function getNpcData() {
		if(API_KEY == "" && !SHARE_KEY) {
			alert("API KEY를 입력해주세요");
			return false;
		}
		
		const server_name = document.getElementById("server").value;
		const channel = document.getElementById("ch").value;
		const locations = getLocatioin();

		document.getElementById("tables").innerHTML = "";
		
		if( isResetNeeded() ) {
			console.log("캐시된 데이터 삭제");
			dataCache = {};
			imageCache = new Map();
		}
		
		let shouldStop = false; // 호출 중단 여부를 결정하는 플래그 변수
		completeCnt = 0;
		maxCompleteCnt = Object.keys(locations).length;
		try {
			for (const npc of locations) {
	            if (shouldStop) break; // 중단 플래그가 설정되면 반복 중단
				const result = {data: await fetchNpcData(npc, server_name, channel)};
	
		        if (result.error) {
		            console.warn(`Error: ${result.error.name}: ${result.error.message}`);
		            //getErrorMessage(npc, result.error.message);
		            shouldStop = true; // 에러 발생 시 중단 플래그 설정
		            break;
		        }
		        
		        if (result && result.data.length > 0) {
	                // 비동기 함수 호출 (await로 작업 완료까지 기다림)	                
	                await getJumoney(result.data, npc);
	            } else {
	                return false; // 조건에 맞지 않으면 false 반환
	            }	            
				
			}			
            
			document.querySelectorAll('.item_nm').forEach(elem => {
				elem.addEventListener('click', toggleLocationHidden);
			});				
			
			document.querySelectorAll('.icon-copy').forEach(elem => {		
				elem.addEventListener('click', copyQcode);
			});
			
			document.querySelectorAll(".icon-external-link").forEach(button => {
				button.addEventListener("click", channelModal)
			});
			
			// .item 아래에 있는 .img-area에만 더블 클릭 이벤트 리스너 추가
			document.querySelectorAll(".item .img-area").forEach(imgArea => {
			    imgArea.addEventListener("dblclick", singleChanneling)
			});
			
			//모바일 더블 클릭
			document.querySelectorAll(".item .img-area").forEach(imgArea => {
			    imgArea.addEventListener("touchend", singleChanneling)
			});
			

	        console.log('주머니 리스트 생성 완료');
		}catch (error) {
        	console.error('에러 발생:' + error);
        	return false; // 에러 발생 시 false 반환
   		}
		
	}
	
	// 이벤트 핸들러 함수 정의
	function toggleLocationHidden(event) {
	    const parent = event.currentTarget.parentElement; // 부모 요소 찾기
	    const locationNm = parent.querySelector('.location_nm'); // .location_nm 요소 찾기
	
	    if (locationNm) {
	        locationNm.classList.toggle('hidden'); // hidden 클래스 토글
	    }
	}
	
	function copyQcode(event) {
		const dataAttribute = event.target.parentElement.querySelector('img');
	    if (dataAttribute) {
	        let srcValue = dataAttribute.getAttribute('data-qCode'); // img의 src 값 가져오기		           
			srcValue = getQcode(srcValue);
			
	        // 클립보드에 복사
	        navigator.clipboard.writeText(srcValue)
	            .then(() => alert('q코드가 클립보드에 복사되었습니다: ' + srcValue))
	            .catch(error => console.error("클립보드에 복사하는 데 실패했습니다: ", error));
	    } else {
	        console.error('img 태그를 찾을 수 없습니다.');
	    }
	}
	
	function getQcode(url){
		const index = url.lastIndexOf("q=");
		const qValue = url.slice(index + 2);
		
		return qValue;
	}
	
	/*
	function getUrlColor(colors, hexOnly){
		let urlColor = [];
		
		if( !hexOnly ) {
			Object.keys(colors).forEach(key => {
				urlColor.push(colors[key].hex);				
			});
		    return urlColor.map(color => '0x' + color.slice(1).toLowerCase()).join('%2C');
		}else{
			urlColor = colors.split(',').map(color => color.trim());
			return urlColor.map(color => '0x' + color.slice(1).toLowerCase()).join('%2C');
		}
		
	}
	*/
	// RGB 배열을 HEX 문자열로 변환하는 함수 (값에 '?'가 포함될 경우 대응)
	function rgbToHex(rgbArray) {
	    return (
	        '#' +
	        rgbArray
	            .map((value) =>
	                value === '?' ? '??' : value.toString(16).padStart(2, '0').toUpperCase() // '?'는 '??'로 변환
	            )
	            .join('')
	    );
	}
	
	// RGB 배열을 RGB 문자열로 변환하는 함수 (값에 '?'가 포함될 경우 대응)
	function rgbToRgbString(rgbArray) {
	    return `${rgbArray
	        .map((value) => (value === '?' ? '?' : value)) // '?'가 들어가면 그대로 유지
	        .join(' ')}`;
	}
	
	// RGB 객체에서 '?'를 반영한 HEX와 RGB 문자열로 변환하는 함수
	function formatColorValuesWithPlaceholder(colorValues, itemName) {
	    const result = {};
	    for (const [key, rgbArray] of Object.entries(colorValues)) {
	        result[key] = {
	            hex: rgbToHex(rgbArray),
	            rgb: rgbToRgbString(rgbArray),
	        };
	    }
	    return result;
	}
	
	async function getJumoney(data, npc) {
		if (data.length < 1 && data.error) {
			alert(data.error.name + "\n" + data.error.message);
			console.warn(`No shop data for NPC: ${npc}`);
			return false;
		}
		const items = data;
		
		let table = `<div class="location-area" data-npc="${npc}" data-location="${locations[npc]}"><h2 class="area-capture">${locations[npc]}</h2><div class="container">`;
		let count = 0;
		const location_nm = locations[npc];

		for (const key of items) {
			const url = key.image_url;
			const item_nm = key.item_display_name;
			const qCode = getQcode(url);
			
			let color = decodeGivenColorQuery(qCode);			
			color = formatColorValuesWithPlaceholder(color);
			//const colorArray = Object.values(color).map(entry => entry.hex);
			//const color = extractItemColorsFromUrl(url);
			//if (count % max_cnt === 0) table += "<tr>";
			//캡쳐용 마을 이름 숨기기
			pouchOrder[count] = item_nm;
			
			table += `<div class="item">`; //<span class="icon icon-repeat channeling"></span>`;
			table += `<span class="icon icon-copy"></span>`;
			table += `<span class="icon icon-external-link" style="right: 2.1em;"></span>`;
			table += `<h3 class="location_nm hidden" data-key="${npc}">${location_nm}</h3>`
			//table += `<img src="${url}" alt="${item_nm}" class="api-img"><label class="item_nm">${item_nm}</label></div>`;
			table += `<div class="img-area"><div class="loading-spinner" data-idx="${count}"></div>`;
			table += `<img src="" alt="${item_nm}" class="api-img hidden" onerror="this.src='${url}'" data-qCode = '${qCode}'>`; 
			table += `<img src="${url}" alt="${item_nm}" class="api-img-org" style="display:none;">`;
			//table += `<img src="${jumoney_url}${jumoney_key[count]}?colors=${getUrlColor(color)}" class="mabibase-img2" onerror="this.src='./cute.png'" style="display:none;">`;
			table += `<img class="mabibase-img" data-index="${count}" item-name="${item_nm}" onerror="this.src='./cute.png'"></div>`;
			table += `<label class="item_nm">${item_nm}</label>${setColorLabel(color)}</div>`;
			
			count++;
			//if (count % max_cnt === 0) table += "</tr>";
		}
		table += "</div></div>";
		
		document.getElementById("tables").insertAdjacentHTML('beforeend', table);
		document.getElementById("loading").style.display = "none";
		document.getElementById("tables").style.display = "block";
		
		// 이미지 로드를 비동기로 처리 (Promise.all 사용)
	    const imagePromises = items.map(async (key, index) => {
	        const item_nm = key.item_display_name;
	        const qCode = getQcode(key.image_url);
	        const locationArea = document.querySelector(`.location-area[data-npc="${npc}"`);
	        const spinner = locationArea.querySelector(`.loading-spinner[data-idx="${index}`); // 로딩 스피너
	        
	        let color = decodeGivenColorQuery(qCode);
	        color = formatColorValuesWithPlaceholder(color);
	        color = Object.values(color).map(entry => entry.hex);
	        
	         // 'open'과 'close' 이미지를 병렬로 생성
		    const [imgCloseUrl, imgUrl] = await Promise.all([
		        createJumoneyImage(item_nm, color, "close"),
		        createJumoneyImage(item_nm, color, "open"),
		    ]);
	
	        // 해당 인덱스에 해당하는 이미지 태그를 업데이트
	        const imgCloseElement = locationArea.querySelector(`.api-img[data-qCode="${qCode}"]`);
	        const imgElement = locationArea.querySelector(`.mabibase-img[data-index="${index}"][item-name="${key.item_display_name}"]`);
	        
	        //imgCloseElement.classList.add("hidden"); // 로딩 중에는 숨김
	        
	        if (imgCloseElement) {
	            imgCloseElement.src = imgCloseUrl;
	            	
			    // 이미지가 로드되면 스피너 제거
			    imgCloseElement.onload = () => {
			        spinner.style.display = "none"; // 스피너 숨김
			        //imageCache.set(cacheKey, imageUrl);
			        imgCloseElement.classList.remove("hidden"); // 이미지 표시
			    };
		
			    // 이미지 로딩 실패 시 대체 이미지 사용
			    imgCloseElement.onerror = () => {
			        spinner.style.display = "none"; // 스피너 숨김
			        imgCloseElement.classList.remove("hidden"); // 이미지 표시
			    };
			    
	        }
	        if (imgElement) {
	            imgElement.src = imgUrl;
	        }
	    });
	    
	    // 모든 이미지 로드가 완료될 때까지 기다림 (선택사항)
   		await Promise.all(imagePromises);
	}

	function setColorLabel(color) {
		if (!color) return '';
		let result = '<div class="color-info">';
		const keys = Object.keys(color);
		for (let i = 0; i < keys.length; i++) {
			const key = keys[i];			
			result += `<p><span class="color_rect" style="background:${color[key].hex};"></span><label class="hex">${color[key].hex}</label><label class="rgb">${color[key].rgb}</label></p>`;
		}
		result += "</div>";
		return result;
	}
	
	// 서버 변경 시 채널 목록 재설정
	document.getElementById("server").addEventListener("change", function() {
		const server = this.value; // 선택한 서버 가져오기
		localStorage.setItem("server", server); // 로컬 스토리지에 저장
	  	setChannel();
	});
	
	document.getElementById("npc_nm").addEventListener("change", function() {
		const npc = this.value; // 선택한 서버 가져오기
	  	localStorage.setItem("npc", npc); // 로컬 스토리지에 저장
		getNpcData();
	});
	
	document.getElementById("ch").addEventListener("change", getNpcData);	
	document.getElementById("setApiKey").addEventListener("click", function() {
		API_KEY = document.getElementById("apiKey").value;
		getNpcData();
	});
	
	// API 키 입력 필드에 이벤트 리스너 추가
	document.getElementById("apiKey").addEventListener("input", function() {
		const apiKey = this.value; // 입력값 가져오기
		localStorage.setItem("apiKey", apiKey); // 로컬 스토리지에 저장
	});

	// 채널 입력 필드에 이벤트 리스너 추가
	document.getElementById("ch").addEventListener("change", function() {
		const channel = this.value; // 입력값 가져오기
		localStorage.setItem("channel", channel); // 로컬 스토리지에 저장
	});	
	
	// 11채널 제외하고 한 지역의 총 호출 횟수 계산
	function allServerChannelCount() {
		let totalCalls = 0;
	
		Object.values(server_ch).forEach(maxChannels => {
			const validChannels = maxChannels - 1; // 11채널 제외
	 		totalCalls += validChannels;
	 	});
	
		 return totalCalls;
	}

	// 채널 전환 버튼
	function prevNextCh() {
		const selectBox = document.getElementById('ch');
		const prevButton = document.getElementById('prev');
		const nextButton = document.getElementById('next');

		prevButton.addEventListener('click', function () {
			selectBox.selectedIndex = selectBox.selectedIndex === 0 ? selectBox.options.length - 1 : selectBox.selectedIndex - 1;
			selectBox.dispatchEvent(new Event('change'));
		});

		nextButton.addEventListener('click', function () {
			selectBox.selectedIndex = selectBox.selectedIndex === selectBox.options.length - 1 ? 0 : selectBox.selectedIndex + 1;
			selectBox.dispatchEvent(new Event('change'));
		});
	}
	
	// 지역 전환 버튼
	function prevNextLocation() {
		const selectBox = document.getElementById('npc_nm');
		const prevButton = document.getElementById('prevLo');
		const nextButton = document.getElementById('nextLo');

		prevButton.addEventListener('click', function () {
			const index = selectBox.selectedIndex;
			const options = selectBox.options;
			
			//전체는 마을 버튼 이동에서 못하게
			selectBox.selectedIndex = index === 1 ? options.length - 1 : index - 1;
			selectBox.dispatchEvent(new Event('change'));
		});

		nextButton.addEventListener('click', function () {
			let index = selectBox.selectedIndex;
			const options = selectBox.options;
			
			//전체는 마을 버튼 이동에서 못하게
			selectBox.selectedIndex = index === options.length - 1 ? 1 : index + 1;
			selectBox.dispatchEvent(new Event('change'));
		});
	}
	
	//해당 지역 전체 채널링 - 단독이랑도 섞으면
	async function checkSetAllServers(all) {
	    if (isCheckingServers) {
	        console.log("이미 서버 확인 중입니다. 중복 실행 방지.");
	        return; // 중복 실행 방지
	    }
	
	    isCheckingServers = true; // 플래그 설정
	    showLoadingOverlay(); // 로딩 화면 표시
	
	    const npc = document.getElementById("npc_nm").value;
	    const items = document.querySelectorAll('.item:not(.nomatch-addItem)');
	
	    if (npc === "all") {
	        isCheckingServers = false;
	        hideLoadingOverlay(); // 로딩 화면 숨김
	        return alert("특정 지역을 선택하세요.", () => false);
	    } else if (items.length < 1) {
	        isCheckingServers = false;
	        hideLoadingOverlay();
	        alert("지역 주머니 리스트 생성 후 다시 시도해주세요.");
	        throw new Error("리스트가 생성되지 않음");
	    }
	    
	    let servers = [document.getElementById("server").value];
	    if (all) {
	        servers = Object.keys(server_ch); // 모든 서버 목록 가져오기
	        maxCompleteCnt = allServerChannelCount();
	    } else {
	        maxCompleteCnt = server_ch[servers[0]] - 1;
	    }
	
	    let groupedItems = {}; // `q` 값으로 주머니를 그룹화
	
	    try {
	        completeCnt = 0;
	        for (const server of servers) {
	            const maxCh = server_ch[server];
	
	            for (let ch = 1; ch <= maxCh; ch++) {
	                if (ch === 11) continue; // 11채널 제외
	
	                const data = await fetchNpcData(npc, server, ch);
	
	                if (data.error) {
	                    hideLoadingOverlay();
	                    isCheckingServers = false; // 플래그 해제
	                }
	
	                data.forEach(item => {
	                    const qValue = extractQValue(item.image_url); // `q` 값 추출
	
	                    // `q` 값으로 초기화
	                    if (!groupedItems[qValue]) {
	                        groupedItems[qValue] = {};
	                    }
	
	                    if (!groupedItems[qValue][item.item_display_name]) {
	                        groupedItems[qValue][item.item_display_name] = {
	                            servers: {},
	                            item_data: item
	                        };
	                    }
	
	                    if (!groupedItems[qValue][item.item_display_name].servers[server]) {
	                        groupedItems[qValue][item.item_display_name].servers[server] = [];
	                    }	                    
		
	                    // 채널 번호 추가
	                    if (!groupedItems[qValue][item.item_display_name].servers[server].includes(ch)) {
	                        groupedItems[qValue][item.item_display_name].servers[server].push(ch);
	                    }
	                });
	            }
	        }
	        displaySets(groupedItems); // 결과 표시
	        
	    } catch (error) {
			console.log(error);
	        console.error("리스트가 생성되지 않았습니다.");
	    } finally {
	        hideLoadingOverlay(); // 로딩 화면 숨김
	        isCheckingServers = false; // 플래그 해제
	    }
	}
		
	// 이미지 URL에서 `q` 값 추출
	function extractQValue(url) {
	    let urlParams = new URL(url).searchParams;
	    urlParams = removeBetweenMarkers(urlParams.get("q"));
	    return urlParams;
	}

	function sortGroupedItems(groupedItems) {
	    const sortedItems = {};

	    // 미리 정의한 순서에 따라 정렬
	    pouchOrder.forEach(itemName => {
	        for (const key in groupedItems) {
	            if (groupedItems[key][itemName]) {
	                if (!sortedItems[key]) sortedItems[key] = {};
	                sortedItems[key][itemName] = groupedItems[key][itemName];
	            }
	        }
	    });
	    return sortedItems;
	}
	
	function removeBetweenMarkers(str) {
	  const startMarker = "5042";
	  const endMarker = "844350";
	
	  // 시작과 끝 부분 찾기
	  const startIndex = str.indexOf(startMarker) + startMarker.length;
	  const endIndex = str.indexOf(endMarker);
	
	  // 시작과 끝 사이의 부분 제거
	  if (startIndex >= 0 && endIndex >= 0) {
	    return str.slice(0, startIndex) + str.slice(endIndex);
	  }
	  // 마커가 없을 경우 원래 문자열 반환
	  return str;
	}
	
	function checkSetCompletionByServer(itemGroup) {
	    const serverItems = {}; // 서버별 아이템 저장
	    const serverSetStatus = {}; // 서버별 완성된 세트 저장
	    const flowerBasketOnly = {}; // 꽃바구니만 있는 서버 저장
	    const integratedSets = new Set(); // 통합으로만 완성된 세트 저장
	    // 서버별 아이템 수집
	    Object.entries(itemGroup).forEach(([itemName, { servers }]) => {
	        Object.entries(servers).forEach(([server]) => {
	            if (!serverItems[server]) serverItems[server] = new Set();
	            serverItems[server].add(itemName);
	        });
	    });
	
	    // 각 서버에서 세트 완성 여부 확인
	    Object.entries(setDefinitions).forEach(([setName, setItems]) => {
	        Object.entries(serverItems).forEach(([server, items]) => {
	            const hasAllItems = setItems.every(item => items.has(item));
	
	            if (setName === "방직셋") {
	                const hasWool = items.has("튼튼한 양털 주머니");
	                const hasOtherItems = ["튼튼한 거미줄 주머니", "튼튼한 가는 실뭉치 주머니", "튼튼한 굵은 실뭉치 주머니"]
	                    .every(item => items.has(item));
	
	                const displayName = hasAllItems
	                    ? "방직셋"
	                    : !hasWool && hasOtherItems
	                    ? "유사 방직"
	                    : null;
	
	                if (displayName) {
	                    if (!serverSetStatus[displayName]) serverSetStatus[displayName] = [];
	                    serverSetStatus[displayName].push(server);
	                }
	            } else if (setName === "실크셋") {
	                const hasFlowerBasket = items.has("튼튼한 꽃바구니");
	                const silkItems = setItems.filter(item => item !== "튼튼한 꽃바구니");
	                const hasSilkItems = silkItems.every(item => items.has(item));
	
	                const displayName = hasSilkItems
	                    ? hasFlowerBasket
	                        ? "실크셋+"
	                        : "실크셋"
	                    : null;
	
	                if (displayName) {
	                    if (!serverSetStatus[displayName]) serverSetStatus[displayName] = [];
	                    serverSetStatus[displayName].push(server);
	                }
	                
	                // 꽃바구니만 있는 경우 처리
	                if (!hasSilkItems && hasFlowerBasket) {
	                    if (!flowerBasketOnly["꽃바구니"]) flowerBasketOnly["꽃바구니"] = [];
	                    flowerBasketOnly["꽃바구니"].push(server);
	                }
	            } else if (hasAllItems) {
	                if (!serverSetStatus[setName]) serverSetStatus[setName] = [];
	                serverSetStatus[setName].push(server);
	            }
	        });
	    });
	
	    // 통합 세트 여부 확인
	    Object.entries(setDefinitions).forEach(([setName, setItems]) => {
	        const collectedItems = new Set();
	
	        Object.values(serverItems).forEach(items => {
	            setItems.forEach(item => {
	                if (items.has(item)) collectedItems.add(item);
	            });
	        });
	
	        const isAlreadyComplete = Object.keys(serverSetStatus).some(status => status.includes(setName));
	
	        if (!isAlreadyComplete && collectedItems.size === setItems.length) {
	            integratedSets.add(setName);
	        }
	    });
	    
	    return { serverSetStatus, integratedSets, flowerBasketOnly  };
	}

	
   	async function displaySets(groupedItems) {	
   	 	if (isDisplaying) {
	        console.warn("displaySets가 이미 실행 중입니다.");
	        return;
	    }
	    
	    isDisplaying = true;
	    
   	    document.querySelectorAll(".channel-info").forEach(element => element.remove());
   	 	document.querySelectorAll(".nomatch-addItem").forEach(element => element.remove());
   	 	
   	    const sortedItems = sortGroupedItems(groupedItems);
   	    const items = document.querySelectorAll('.item:not(.nomatch-addItem)');
   	    const container = document.querySelectorAll(".container")[0];
   	 	const processedColors = new Set(); // 처리된 색상 키를 추적
		try {
		    for (const [index, item] of items.entries()) {
		        const imageUrl = item.querySelector(".api-img-org").src;
		        const qValue = extractQValue(imageUrl);
		        const matchedItemGroup = sortedItems[qValue];
		
		        if (matchedItemGroup) {
		            // 비동기적으로 createChannelInfoDiv를 호출하고 기다림
		            const channelInfoDiv = await createChannelInfoDiv(matchedItemGroup);
		            item.appendChild(channelInfoDiv); // 채널 정보 추가
		            processedColors.add(qValue);
		        }
		    }
	   	    
	   		// 매칭되지 않은 색상 그룹을 새로 생성하여 .container에 추가
		    for (const [key, itemGroup] of Object.entries(sortedItems)) {
				let forloop = true;
		        if (!processedColors.has(key) && forloop) {			
					// 첫 번째 아이템의 데이터를 가져오기
		        	const firstItemKey = Object.keys(itemGroup)[0]; 
		        	const firstItemData = itemGroup[firstItemKey].item_data;
        			const qValue = getQcode(firstItemData.image_url);
		            const newItem = await createNewItem(qValue, itemGroup);
		            if(!newItem) {
						forloop = false;
						return false;
				    }        
		            if(container) container.appendChild(newItem); // .container에 새 항목 추가
		        }
		    }
	
			document.querySelectorAll('.item_nm').forEach(elem => {
				elem.removeEventListener('click', toggleLocationHidden);
				elem.addEventListener('click', toggleLocationHidden);
			});
			
			document.querySelectorAll('.icon-copy').forEach(elem => {
				elem.removeEventListener('click', copyQcode)		
				elem.addEventListener('click', copyQcode);
			});	
			
			document.querySelectorAll(".icon-external-link").forEach(button => {
				button.removeEventListener('click', channelModal)
				button.addEventListener("click", channelModal)				
			});
		}finally{
        	isDisplaying = false; // 함수 종료 시 플래그 해제    
		}	
   	}	
   	
	// 채널 정보 DIV 생성 함수
	async function createChannelInfoDiv(itemGroup, returnObj) {
	    const channelInfoDiv = document.createElement("div");
	    channelInfoDiv.classList.add("channel-info");
	    channelInfoDiv.innerHTML = `<h4 class="toggle-all-info">채널링 정보</h4>`;
	    let itemDataList = [];
	    
	    const { serverSetStatus, integratedSets, flowerBasketOnly } = checkSetCompletionByServer(itemGroup);
	
	    const serverSetInfo = generateServerSetInfo(serverSetStatus);
	    const integratedSetInfo = generateIntegratedSetInfo(integratedSets);
	    const flowerBasketInfo = generateFlowerBasketInfo(flowerBasketOnly);
	
	    if (serverSetInfo) {
	        channelInfoDiv.innerHTML += `<p class="set-info">${serverSetInfo}</p>`;
	    }
	    if (integratedSetInfo) {
	        channelInfoDiv.innerHTML += `<p class="set-info">${integratedSetInfo}</p>`;
	    }
	    if (flowerBasketInfo) {
	        channelInfoDiv.innerHTML += `<p class="set-info">${flowerBasketInfo}</p>`;
	    }
	
	    for (const [itemName, { servers, item_data }] of Object.entries(itemGroup)) {
	        const itemInfo = await generateItemInfo(itemName, servers, item_data, returnObj, itemDataList);
	        channelInfoDiv.innerHTML += itemInfo;
	    }
	
	    // 클릭 이벤트 핸들러 등록
	    addClickEventsToChannelInfo(channelInfoDiv);
	
	    if (returnObj) return { div: channelInfoDiv, data: itemDataList };
	    return channelInfoDiv;
	}
	
	// 서버 세트 정보 생성 함수
	function generateServerSetInfo(serverSetStatus) {
	    return orderedSetDefinitions
	        .map(setName => {
	            if (serverSetStatus[setName]) {
	                const servers = Object.keys(server_ch)
	                    .filter(server => serverSetStatus[setName].includes(server))
	                    .map(server => `<label class="server-mark ${server}" data-set="${setName}" data-server="${server}"></label>`)
	                    .join(" ");
	                return `<span class="setComplete ${setName}" data-set="${setName}">${setName}</span> ${servers}`;
	            }
	            return null;
	        })
	        .filter(info => info)
	        .join("<br/>");
	}
	
	// 통합 세트 정보 생성 함수
	function generateIntegratedSetInfo(integratedSets) {
	    return orderedSetDefinitions
	        .filter(setName => integratedSets.has(setName))
	        .map(setName => `<span class="setComplete ${setName}" data-set="${setName}">${setName}</span>`)
	        .join(" ");
	}
	
	// 꽃바구니 세트 정보 생성 함수
	function generateFlowerBasketInfo(flowerBasketOnly) {
	    if (flowerBasketOnly["꽃바구니"]) {
	        const servers = Object.keys(server_ch)
	            .filter(server => flowerBasketOnly["꽃바구니"].includes(server))
	            .map(server => `<label class="server-mark ${server}" data-set="꽃바구니" data-server="${server}"></label>`)
	            .join(" ");
	        return `<span class="setComplete 꽃바구니" data-set="꽃바구니">꽃바구니</span> ${servers}`;
	    }
	    return "";
	}
	
	// 아이템 정보 생성 함수
	async function generateItemInfo(itemName, servers, item_data, returnObj, itemDataList) {
	    const qCode = getQcode(item_data.image_url);
	    let color = await decodeGivenColorQuery(qCode);
	    color = formatColorValuesWithPlaceholder(color, qCode);
	
	    let itemInfo = `<p class="channel-info-item" data-item="${itemName}">
	        <label class="info-jumoney-name">${itemName}<span class="color_rect hidden_rect" alt="${color.C.hex}&nbsp;&nbsp;${color.C.rgb}" style="background:${color.C.hex};"></span></label>
	        <span class="color-03" style="display:none" color-data="${color.A.hex}, ${color.B.hex}, ${color.C.hex}"></span>`;
	
	    if (returnObj) itemDataList.push({ dataItem: itemName, colorData: `${color.A.hex}, ${color.B.hex}, ${color.C.hex}` });
	
	    for (const [server, chList] of Object.entries(servers)) {
	        itemInfo += `<span class="info-channel all-server" data-server="${server}">
	            <label class="server-mark ${server}"></label>${chList.join(", ")}</span>`;
	    }
	
	    return itemInfo + "</p>";
	}
	
	// 클릭 이벤트 핸들러 추가 함수
	function addClickEventsToChannelInfo(channelInfoDiv) {
	    channelInfoDiv.querySelectorAll(".setComplete").forEach(setElement => {
	        setElement.addEventListener("click", (e) => handleSetClick(e, setElement));
	    });
	
	    channelInfoDiv.querySelectorAll(".server-mark").forEach(serverElement => {
	        serverElement.addEventListener("click", (e) => handleServerClick(e, serverElement));
	    });
	
	    channelInfoDiv.querySelector(".toggle-all-info").addEventListener("click", (e) => {
	        resetChannelVisibility(e.target.closest(".channel-info"));
	    });
	}
	
	// 세트 클릭 핸들러
	function handleSetClick(e, setElement) {
	    const setName = setElement.getAttribute("data-set");
	    const channelInfo = e.target.closest(".channel-info");
	    const activeComplete = channelInfo.querySelector(".setComplete.active");
	    const activeServer = channelInfo.querySelector(".server-mark.active");
	
	    let filterUse = true;
	    if (activeServer) activeServer.classList.remove("active");
	    if (activeComplete && activeComplete !== e.target) {
	        activeComplete.classList.remove("active");
	    } else {
	        filterUse = false;
	    }
	    if (!activeComplete) filterUse = true;
	
	    toggleSetVisibility(setName, channelInfo, filterUse);
	    e.target.classList.toggle("active");
	    e.stopPropagation();
	}
	
	// 서버 클릭 핸들러
	function handleServerClick(e, serverElement) {
	    const server = serverElement.getAttribute("data-server");
	    const setName = serverElement.getAttribute("data-set");
	    const channelInfo = e.target.closest(".channel-info");
	    const activeServer = channelInfo.querySelector(".server-mark.active");
	    const activeComplete = channelInfo.querySelector(".setComplete.active");
	
	    let filterUse = true;
	    if (activeComplete) activeComplete.classList.remove("active");
	    if (activeServer && activeServer !== e.target) {
	        activeServer.classList.remove("active");
	    } else {
	        filterUse = false;
	    }
	    if (!activeServer) filterUse = true;
	
	    toggleChannelVisibility(setName, server, channelInfo, filterUse);
	    e.target.classList.toggle("active");
	    e.stopPropagation();
	}
	
	// 세트 가시성 토글
	function toggleSetVisibility(setName, channelInfo, filterUse) {
	    if (filterUse) {
	        channelInfo.querySelectorAll(".channel-info-item").forEach(item => {
	            const itemName = item.getAttribute("data-item");
	            item.style.display = isPartOfSet(setName, itemName) ? "block" : "none";
	        });
	    } else {
	        resetChannelVisibility(channelInfo);
	    }
	}
	
	// 서버 가시성 토글
	function toggleChannelVisibility(setName, server, channelInfo, filterUse) {
	    if (filterUse) {
	        channelInfo.querySelectorAll(".channel-info-item").forEach(item => {
	            const itemName = item.getAttribute("data-item");
	            item.style.display = isPartOfSet(setName, itemName) ? "block" : "none";
	            item.querySelectorAll(".info-channel").forEach(channel => {
	                channel.style.display = (channel.getAttribute("data-server") === server) ? "block" : "none";
	            });
	        });
	    } else {
	        resetChannelVisibility(channelInfo);
	    }
	}
	
	// 채널 가시성 리셋
	function resetChannelVisibility(channelInfo) {
	    channelInfo.querySelectorAll(".channel-info-item").forEach(item => {
	        item.style.display = "block";
	        item.querySelectorAll(".info-channel").forEach(channel => {
	            channel.style.display = "block";
	        });
	    });
	    channelInfo.querySelectorAll(".active").forEach(activeElement => {
	        activeElement.classList.remove("active");
	    });
	}
	// 이벤트 처리 함수: 세트와 서버 라벨 클릭
	function addClickEventsToChannelInfo(channelInfoDiv) {
	    channelInfoDiv.querySelectorAll(".setComplete").forEach(setElement => {
	        setElement.addEventListener("click", (e) => {
	            const setName = setElement.getAttribute("data-set");
	            const channelInfo = e.target.closest(".channel-info");
	            const activeComplete = channelInfo.querySelector(".setComplete.active");
	            const activeServer = channelInfo.querySelector(".server-mark.active");
	
	            let filterUse = true;
	
	            if (activeServer) activeServer.classList.remove("active");
	
	            if (activeComplete && activeComplete !== e.target) {
	                activeComplete.classList.remove("active");
	            } else {
	                filterUse = false; // 같은 요소를 클릭하면 필터 사용 취소
	            }
	
	            if (!activeComplete) filterUse = true; // 맨 처음 클릭일 때
	
	            toggleSetVisibility(setName, channelInfo, filterUse);
	            e.target.classList.toggle("active");
	            e.stopPropagation();
	        });
	    });
	
	    channelInfoDiv.querySelectorAll(".server-mark").forEach(serverElement => {
	        serverElement.addEventListener("click", (e) => {
	            const server = serverElement.getAttribute("data-server");
	            const setName = serverElement.getAttribute("data-set");
	            const channelInfo = e.target.closest(".channel-info");
	            const activeServer = channelInfo.querySelector(".server-mark.active");
	            const activeComplete = channelInfo.querySelector(".setComplete.active");
	            let filterUse = true;
	
	            if (activeComplete) activeComplete.classList.remove("active");
	
	            if (activeServer && activeServer !== e.target) {
	                activeServer.classList.remove("active");
	            } else {
	                filterUse = false;
	            }
	
	            if (!activeServer) filterUse = true;
	
	            toggleChannelVisibility(setName, server, channelInfo, filterUse);
	
	            e.target.classList.toggle("active");
	            e.stopPropagation();
	        });
	    });
	
	    channelInfoDiv.querySelector(".toggle-all-info").addEventListener("click", (e) => {
	        resetChannelVisibility(e.target.closest(".channel-info"), true); // 이벤트 객체를 매개변수로 전달
	    });
	}
	
	// 특정 세트만 표시하는 함수
	function toggleSetVisibility(setName, channelInfo, filterUse) {
	    if (filterUse) {
	        channelInfo.querySelectorAll(".channel-info-item").forEach(item => {
	            const itemName = item.getAttribute("data-item");
	            const partOfSet = isPartOfSet(setName, itemName);
	            item.style.display = partOfSet ? "block" : "none";
	
	            item.querySelectorAll(".info-channel").forEach(channel => {
	                channel.style.display = "block";
	            });
	        });
	    } else {
	        resetChannelVisibility(channelInfo, false);
	    }
	}
	
	// 특정 서버의 채널만 표시하는 함수
	function toggleChannelVisibility(setName, server, channelInfo, filterUse) {
	    if (filterUse) {
	        channelInfo.querySelectorAll(".channel-info-item").forEach(item => {
	            const itemName = item.getAttribute("data-item");
	            const partOfSet = isPartOfSet(setName, itemName);
	            item.style.display = partOfSet ? "block" : "none";
	
	            item.querySelectorAll(".info-channel").forEach(channel => {
	                const channelServer = channel.getAttribute("data-server");
	                channel.style.display = (channelServer === server) ? "block" : "none";
	            });
	        });
	    } else {
	        resetChannelVisibility(channelInfo, false);
	    }
	}
	
	// 채널 가시성 리셋 함수
	function resetChannelVisibility(channelInfo, all) {
	    const activeServer = channelInfo.querySelector(".server-mark.active");
	    const activeComplete = channelInfo.querySelector(".setComplete.active");
	
	    if (activeServer && all) activeServer.classList.remove("active");
	    if (activeComplete && all) activeComplete.classList.remove("active");
	
	    channelInfo.querySelectorAll(".channel-info-item").forEach(item => {
	        item.style.display = "block";
	
	        item.querySelectorAll(".info-channel").forEach((channel) => {
	            channel.style.removeProperty("display");
	            channel.style.display = "block";
	        });
	    });
	}

	function serverMark(e){
		const serverElement = e.tartget
		const server = serverElement.getAttribute("data-server");
        const setName = serverElement.getAttribute("data-set");
        const channelInfo = e.target.closest(".channel-info");
        const activeServer = channelInfo.querySelector(".server-mark.active");
        const activeComplete = channelInfo.querySelector(".setComplete.active");	            
        let fillterUse = true;
        
        if(activeComplete) activeComplete.classList.remove("active");
        
        //e.target.classList.toggle("active");	            
        // 기존 활성화된 server-mark의 active 클래스 제거 (다른 요소일 경우만)	            
        if (activeServer && activeServer !== e.target) {		            
            activeServer.classList.remove("active");
        }else{ //같은 요소이면 취소
			fillterUse = false;
		}				
		
		//맨 처음 클릭일때
		if(!activeServer) fillterUse = true;
		
        toggleChannelVisibility(setName, server, channelInfo, fillterUse);
        	           
        e.target.classList.toggle("active");
        e.stopPropagation();
	}
	
	//세트 여부 확인
	function isPartOfSet(setName, itemName) {
	    return (
	        (setName === "실크셋" && setDefinitions["실크셋"].includes(itemName) && itemName !== "튼튼한 꽃바구니") ||
	        (setName === "실크셋+" && setDefinitions["실크셋"].includes(itemName)) ||
	        (setName === "유사 방직" && setDefinitions["방직셋"].includes(itemName) && itemName !== "튼튼한 양털 주머니") ||
	        (setName === "꽃바구니" && itemName === "튼튼한 꽃바구니") ||
	        (setDefinitions[setName]?.includes(itemName) && setName !== "실크셋")
	    );
	}
	
	
	// 새로운 팔레트 항목 생성 함수
	async function createNewItem(qValue, itemGroup) {
	    const newItem = document.createElement("div");
	    const firstKey = Object.keys(itemGroup)[0];
    	const itemData = itemGroup[firstKey]?.item_data;
	    newItem.classList.add("item", "nomatch-addItem");
	   
	    // API 데이터에서 이미지 URL이 존재하는지 확인
	    if (!itemData || !itemData.image_url) {
	        alert("API 데이터에서 유효한 이미지 URL을 찾을 수 없습니다.");
	        console.error("Invalid API data:", itemGroup);
	        return null; // 오류 시 null 반환
	    }
	    
	    const url = itemData.image_url;
	    
	    const areaCaptureElement = document.querySelector(".area-capture");	    
	    if (!areaCaptureElement) {
	        alert("지역 정보 요소를 찾을 수 없습니다.");
	        console.error("No element with class 'area-capture' found.");
	        return null; // 오류 시 null 반환
	    }
	    
	    const location_nm = areaCaptureElement.innerText;
	    
	    let color = await decodeGivenColorQuery(qValue); // 비동기 호출
	        color = formatColorValuesWithPlaceholder(color, qValue);
	    //이미지 api 호출 미사용
   		//const mabibaseUrl = `${jumoney_url}${jumoney_key2[firstKey]}?colors=${getUrlColor(color)}" class="mabibase-img" onerror="this.src='./cute.png'` || './cute.png'; // Mabibase 이미지 URL
	    
	    let html = `
	        <span class="icon icon-copy" data-qvalue="${qValue}" title="복사"></span>
	        <span class="icon icon-external-link" style="right: 2.1em;" title="모달"></span>
	        <h3 class="location_nm hidden">${location_nm}</h3>	        
	        <div class="img-area">
	        <img src="" alt="${firstKey}" class="api-img" data-qCode="${qValue}" onerror="this.src='${url}'">
	        <img src="${url}" alt="${firstKey}" class="api-img-org" style="display:none;">
	        <img class="mabibase-img" onerror="this.src='./cute.png'" data-index="${qValue}" item-name="${firstKey}"></div>
	        <label class="item_nm">${firstKey}</label>
	        ${setColorLabel(color)}
	    `;
	    
		newItem.innerHTML = html;
		
		//채널 정보 추가
	    const channelInfoDiv = await createChannelInfoDiv(itemGroup);
	    newItem.appendChild(channelInfoDiv);
	    
	     // 'open'과 'close' 이미지를 병렬로 생성
	    const colors = Object.values(color).map(entry => entry.hex);
	    //const spinner = locationArea.querySelector(`.loading-spinner[data-idx="${qValue}`); // 로딩 스피너
	    const [imgCloseUrl, imgUrl] = await Promise.all([
	        createJumoneyImage(firstKey, colors, "close"),
	        createJumoneyImage(firstKey, colors, "open"),
	    ]);

        // 해당 인덱스에 해당하는 이미지 태그를 업데이트
        const imgCloseElement = newItem.querySelector(`.api-img[data-qCode="${qValue}"]`);
        const imgElement = newItem.querySelector(`.mabibase-img[data-index="${qValue}"][item-name="${firstKey}"]`);
        
        if (imgCloseElement) {
            imgCloseElement.src = imgCloseUrl;
            /*
             // 이미지가 로드되면 스피너 제거
		    imgCloseElement.onload = () => {
		        spinner.style.display = "none"; // 스피너 숨김
		        imgCloseElement.classList.remove("hidden"); // 이미지 표시
		    };
	
		    // 이미지 로딩 실패 시 대체 이미지 사용
		    imgCloseElement.onerror = () => {
		        spinner.style.display = "none"; // 스피너 숨김
		        imgCloseElement.classList.remove("hidden"); // 이미지 표시
		    };
		    */
        }
        if (imgElement) {
            imgElement.src = imgUrl;
        }
		
	    return newItem;
	}
	
    async function fetchNpcData(npc, server, channel) {
    	const cacheKey = `${npc}_${server}_${channel}`; // 중복 호출을 피하기 위한 캐시키 생성 //호출 횟수 아껴야함...ㅠㅠ
        let url = `https://open.api.nexon.com/mabinogi/v1/npcshop/list?npc_name=${npc}&server_name=${server}&channel=${channel}`;
        //if(SHARE_KEY) url = `https://jumoney-shuus-projects-28c29ca9.vercel.app/api/fetchNpcData?npc=${npc}&server=${server}&channel=${channel}`;
		// 이미 진행 중인 호출인지 확인
		if (inProgressCalls.has(cacheKey)) {
			console.log(`이미 진행 중인 호출: ${cacheKey}`);
			return; // 중복 호출 방지
		}
        
  		// 호출 진행 중임을 기록
 		inProgressCalls.add(cacheKey);

    	//리셋 시간되면 무조건 캐시 초기화 밑 tables 초기화
    	if(isResetNeeded()){
			document.getElementById("tables").innerHTML = "";
			dataCache = {};
			imageCache = new Map();
		}
    	
    	// 리셋 시간이 지나지 않았고 캐시가 존재하면 재사용
        else if (dataCache[cacheKey] ) {
			//간혹 리셋 되었는데 캐시된 데이터 사용한다는 로그가 뜨며 리스트 생성 안하는 증상 방지
			if( dataCache[cacheKey] ) { //데이터가 없다면 다시 불러오기
	            console.log(`캐시된 데이터 사용: ${cacheKey}`);
	            document.getElementById("curCallState").innerText = `캐시된 데이터 사용: ${cacheKey}`;
		            
	            completeCnt += 1;
	            setCompleteCnt();
	            
	            inProgressCalls.delete(cacheKey); // 진행 중 상태 해제
	            return dataCache[cacheKey];
            }
        }
        
        document.getElementById("curCallState").innerText = `API 호출: ${cacheKey}`;        
        console.log(`API 호출: ${cacheKey}`);
        
        try {
			// API 키가 "test"로 시작하면 호출 제한 적용
		    if (API_KEY.startsWith("test") && !SHARE_KEY) {
		      await throttle();
		    }
		    
		    let response, data;
			if( !SHARE_KEY ) { 
            	response = await fetch(url, { headers: { "x-nxopen-api-key": API_KEY } });
            	data = await response.json();
            }else{
				response = await fetch(url);
    			data = await response.json();
    			data = data.data; 			
			}	
            	
            if (!response.ok || !data.shop) {
				const errorName = data.error.name;
				const errorMessage = getErrorMessage(errorName);
				alert(errorName+"\n"+errorMessage.join("\n"));
            	console.error(errorName + ": " + data.error.message);
            	document.getElementById("loading").style.display = "none";
            	document.getElementById("results").innerHTML = errorName+"<br/>"+errorMessage[0] + "<br/>" + errorMessage[1];
            	return data;
            }else{
				document.getElementById("results").innerHTML = "";	
			
            
	            //리셋 시간 변경 됐을 경우만 저장
	            if (!nextResetTime || new Date(data.date_shop_next_update) > nextResetTime ) {
	                nextResetTime = new Date(data.date_shop_next_update);
	                setTime(nextResetTime);
	                console.log(`다음 리셋 시간 갱신: ${nextResetTime}`);
	            }
	            
	        	// 주머니 데이터 추출 및 캐시에 저장
	            const items = data.shop.filter(shop => shop.tab_name === "주머니").flatMap(shop => shop.item);
	            dataCache[cacheKey] = items;  // 캐시에 저장
	            
	            completeCnt += 1;
	            setCompleteCnt();
	            
	            return items;
            }
            
            //checkSync(data.date_inquire); // 서버시간 동기화
            
        } catch (error) {
            console.error(`API 호출 실패: ${error.message}`);
	        // 실패 시 상태 초기화
	        inProgressCalls.delete(cacheKey); 
	        dataCache[cacheKey] = null; // 캐시 무효화
	        hideLoadingOverlay(); // 로딩 오버레이 숨기기
	        alert('데이터를 불러오지 못했습니다. 잠시 후 다시 시도해주세요.');
        }finally {
			inProgressCalls.delete(cacheKey); // 호출 완료 후 진행 중 상태 해제
		}
    }

	//리셋 시간 체크
	function isResetNeeded() {
	    const now = new Date();
	    let result  = false;
	    	    
	    if(nextResetTime == null) result = true;
	    else if ( now >= nextResetTime ) result = true;
	  		
	    return result;
	}
	
	function setTime(nextResetTime) {
		const resetTime = convertToKST(nextResetTime);
		
        document.getElementById("today").innerText = resetTime.date;
        document.getElementById("lastCallTime").innerText = convertToKST(new Date().toISOString()).time;
        document.getElementById("time").innerText = resetTime.time;
	}
	
	
	// 한국 시간으로 리셋 시간 표시
	function convertToKST(isoDate) {
	    const date = new Date(isoDate).toLocaleString('ko-KR', {
	        timeZone: 'Asia/Seoul',
	        year: 'numeric',
	        month: '2-digit',
	        day: '2-digit',
	        hour: '2-digit',
	        minute: '2-digit',
	        hour12: true
	    });
	    
	    // 날짜와 시간-분을 분리
    	const parts = date.split(' ');
	
    	const datePart = parts.slice(0, 3).join('-').replace(/\./g, '').trim(); // "YYYY-MM-DD"
    	const timePart = `${parts[3]} ${parts[4]}`.trim(); // "오전 05:08" 형식

	    return { 
	        date: datePart,
	        time: timePart
	    };
	}
	
	function showLoadingOverlay() {
	  document.getElementById("loadingOverlay").classList.remove("hidden");
	}
	
	function hideLoadingOverlay() {
	  document.getElementById("loadingOverlay").classList.add("hidden");
	  document.getElementById("completeCnt").innerText = "";
	  document.getElementById("curCallState").innerText = "";
	}
	
	function setCompleteCnt() {
		document.getElementById("completeCnt").innerText = "(" + completeCnt+"/"+maxCompleteCnt + ")";
	}
	
	document.getElementById("loadingClose").addEventListener("click", () => { hideLoadingOverlay();});  
	
	const modal = document.getElementById("itemModal");
    const modalItemName = document.getElementById("modalItemName");
    const modalApiImage = document.getElementById("modalApiImage");
    const modalMabibaseImage = document.getElementById("modalMabibaseImage");
    const modalItemColors = document.getElementById("modalItemColors");
    const rightLayout = document.getElementById("right-content");
    const closeModalButton = document.getElementById("closeModal");
	const imageListSample = document.querySelector('.image-list-sample');
	    
	function channelModal(e) {	    
		const item = e.target.closest(".item"); // 현재 버튼이 속한 item 요소 찾기
		//const itemColorInfo = [];		
    
        // 초기화: right-layout 내부의 기존 세트 및 채널 정보 제거
		updateModalTime();
         // 지역 이름 설정
        const locationName = item.querySelector(".location_nm").textContent;
        modalItemName.textContent = locationName;       

        // 이미지 설정
        const apiImageSrc = item.querySelector(".api-img").src;
        let mabibaseImageSrc = item.querySelector(".mabibase-img").src;
        
	    // 이미지 설정 및 로딩 처리
	    //setupImageWithSpinner(modalApiImage, apiImageSrc);
	    //setupImageWithSpinner(modalMabibaseImage, mabibaseImageSrc);

        modalApiImage.src = apiImageSrc;
        modalMabibaseImage.src = mabibaseImageSrc;
        
        
        // 복제된 이미지에 동일한 경로 설정
        modalMabibaseImageCopy.src = mabibaseImageSrc;

        // 색상 정보 추가
        const colorInfo = item.querySelector(".color-info");
        if (colorInfo) {
            modalItemColors.innerHTML = colorInfo.outerHTML;
        } else {
            console.warn("색상 정보가 없습니다.");
        }
     
        // 채널 정보 추가 (append 방식)
        const channelInfo = item.querySelector(".channel-info");
        let itemDataList = []; // itemDataList 초기화
        
		if (channelInfo) {
	        const channelItems = channelInfo.querySelectorAll(".channel-info-item");
	
	        itemDataList = Array.from(channelItems).map((channelItem) => {
	            const dataItem = channelItem.getAttribute("data-item"); // data-item 값 추출
	            const colorDataSpan = channelItem.querySelector(".color-03"); // color-03 요소 찾기
	            const colorData = colorDataSpan
	                ? colorDataSpan.getAttribute("color-data") // color-data 값 추출
	                : null;
	            
	            const colorInfo = {};
	            colorInfo[dataItem] = colorData;	            
	         
				return {dataItem, colorData}
	        });
	        
	        // 채널 정보 복제 및 추가
	        const channelInfoClone = channelInfo.cloneNode(true);
	        rightLayout.append(channelInfoClone);
	        addClickEventsToChannelInfo(channelInfoClone);
	        
			// 모든 .color_rect 요소에 툴팁 기능 추가
			document.querySelectorAll('#itemModal .info-jumoney-name .color_rect').forEach((element) => {
			    const tooltipText = element.getAttribute('alt'); // alt 값 가져오기
			    const tooltip = document.createElement('div'); // 툴팁 요소 생성
			    tooltip.className = 'tooltip';
			    tooltip.textContent = tooltipText;
			    document.body.appendChild(tooltip);
			
			    // 마우스 오버 시 툴팁 표시
			    element.addEventListener('mouseenter', (event) => {
			        tooltip.style.left = `${event.pageX}px`;
			        tooltip.style.top = `${event.pageY - 30}px`;
			        tooltip.style.opacity = 1;
			    });
			
			    // 마우스 이동 시 툴팁 위치 업데이트
			    element.addEventListener('mousemove', (event) => {
			        tooltip.style.left = `${event.pageX}px`;
			        tooltip.style.top = `${event.pageY - 30}px`;
			    });
			
			    // 마우스 아웃 시 툴팁 숨기기
			    element.addEventListener('mouseleave', () => {
			        tooltip.style.opacity = 0;
			    });
			});
			
	        
	    } else {
	        console.warn("채널 정보가 없습니다.");
	        const noChannelMessage = document.createElement("p");
	        noChannelMessage.textContent = "채널 정보가 없습니다.";
	        rightLayout.append(noChannelMessage);
	    }
	    
	    populateImageListSample(itemDataList);
	    // 모달 열기
	    modal.style.display = "flex";
	}
	
	const defaultImagePath = "./image/jumoney/all_base/"; // 기본 이미지 경로
	
	// 아이템 이미지를 생성하는 함수 (스피너 포함)
	async function createItemImage(itemName, itemData) {
	    const container = document.createElement("div"); // 이미지와 스피너를 감싸는 컨테이너
	    container.classList.add("image-container2");
	
	    const imgElement = document.createElement("img");
	    const spinner = document.createElement("div"); // 로딩 스피너
	    spinner.classList.add("loading-spinner");
	
	    container.appendChild(spinner); // 스피너 추가
	    container.appendChild(imgElement); // 이미지 추가
	    
	    imgElement.classList.add("hidden"); // 로딩 중에는 숨김
		// 스피너를 먼저 표시하고 이미지 생성 진행
	    requestAnimationFrame(async () => {
	        try {
			    let imageUrl;
			    const cacheKey = `${itemName}-${JSON.stringify(itemData)}`;
			    const fallbackImage = "./cute.png"; // 실패 시 대체 이미지
			    // 아이템 정보가 있을 때: API URL 사용
		    
			    if (imageCache.has(cacheKey)) {
					imageUrl = imageCache.get(cacheKey);
					//console.log("캐시된 이미지 사용");
					// **캐시된 이미지가 기본 이미지일 경우 클래스 추가**
		            if (imageUrl.includes(defaultImagePath)) {
		                imgElement.classList.add("default_jumoney");
		            }
			    } else {
				    if (itemData) {
				        const colors = itemData.colorData.split(',').map(color => color.trim());
				        imageUrl = await createJumoneyImage(itemName, colors, "open");
				        //console.log(`생성된 이미지 URL: ${imageUrl}`);
				    } else {
				        // 아이템 정보가 없을 때: 기본 경로 이미지 사용
				        const itemKey = jumoney_key2[itemName];
				        imageUrl = `${defaultImagePath}${itemKey}.png`;
				        if (imgElement) imgElement.classList.add("default_jumoney"); // 기본 이미지에 클래스 추가
				    }
				    
			   		imageCache.set(cacheKey, imageUrl);
		    	}
		    
			    imgElement.src = imageUrl; // 이미지 로드 시작
			    imgElement.alt = itemName;
			    
				
			    // 이미지가 로드되면 스피너 제거
			    imgElement.onload = () => {
			        spinner.style.display = "none"; // 스피너 숨김
			        imgElement.classList.remove("hidden"); // 이미지 표시
			    };
		
			    // 이미지 로딩 실패 시 대체 이미지 사용
			    imgElement.onerror = () => {
			        imgElement.src = fallbackImage;
			        spinner.style.display = "none"; // 스피너 숨김
			        imgElement.classList.remove("hidden"); // 이미지 표시
			    };
	    	}
		    catch (error) {
	            console.error(`이미지 생성 실패: ${error.message}`);
	            imgElement.src = "./cute.png";
	            spinner.style.display = "none";
	            imgElement.classList.remove("hidden");
	        }
    	}); //  스피너 표시를 먼저 보장
	
	    return container; // 부모 요소 반환 (이미지와 스피너 포함)
	}
	
	// 현재 시간과 리셋 시간 업데이트 함수
	function updateModalTime() {
	    const now = new Date(); // 현재 시간	    
	    const resetTime = document.getElementById('resetTime').textContent; // 리셋 시간 파싱
	
	    // 현재 시간 표시 (한국 시간 기준)
	    const { time: currentTimeFormatted } = convertToKST(now.toISOString());
	    document.querySelector('#modal-realTime .set-time').textContent = currentTimeFormatted;
	
	    // 리셋 시간 표시
	    document.querySelector('#modal-resetTime .set-time').textContent = resetTime.split("다음 리셋:")[1].trim();
	
	    // 남은 시간 계산
	    const diffMinutes = calculateTimeDifference(now, nextResetTime);
	    document.querySelector('#modal-haveTime .set-time').textContent = `${diffMinutes}분`;
	}
	
	// populateImageListSample: 세트별 아이템 이미지를 리스트에 추가
	async function populateImageListSample(itemDataList) {
	    const imageListSample = document.querySelector(".image-list-sample");
	    // setDefinitions에 정의된 각 세트를 순회하며 처리
	    for (const [setName, items] of Object.entries(setDefinitions)) {
	        const setDiv = document.createElement("div");
	        setDiv.classList.add("set-group");
	
	        for (const itemName of items) {
	            const itemData = itemDataList.find(data => data.dataItem === itemName); // 아이템 데이터 검색
	            const imgElement = await createItemImage(itemName, itemData); // 이미지 생성
	            setDiv.appendChild(imgElement); // 세트에 이미지 추가
	        };
	
	        imageListSample.appendChild(setDiv); // 전체 리스트에 세트 추가
	    };
	}	
	
	// 두 시간의 차이를 분 단위로 계산하는 함수
	function calculateTimeDifference(currentTime, resetTime) {
	    const diff = resetTime - currentTime; // 밀리초 단위 차이
	    return Math.max(Math.floor(diff / 1000 / 60), 0); // 분 단위로 변환 (0 이하 방지)
	}
	
	
	// 모달 초기화 함수
	async function initializeModal() {
	    document.querySelector('#modal-realTime .set-time').textContent = ''; // 현재 시간 초기화
	    document.querySelector('#modal-resetTime .set-time').textContent = ''; // 리셋 시간 초기화
	    document.querySelector('#modal-haveTime .set-time').textContent = ''; // 남은 시간 초기화
	    document.getElementById('modalApiImage').src = ''; // 이미지 초기화
	    document.getElementById('modalMabibaseImage').src = ''; // 이미지 초기화
	    document.getElementById('modalMabibaseImageCopy').src = ''; // 이미지 복사본 초기화	    
        rightLayout.innerHTML = "";
        modalItemColors.innerHTML = "";
        imageListSample.innerHTML = "";
	}
	/*
	document.getElementById("captureBtn").addEventListener("click", async () => {
	    try {
	        // 캡처할 영역 선택 (모달 본체)
	        const captureTarget = document.querySelector(".modal-content");
			
	        // 레이아웃 렌더링 완료 후 캡처 실행
	        await new Promise((resolve) => requestAnimationFrame(resolve));

	        // 숨길 요소 임시로 숨기기
	        const elementsToHide = [
	            document.getElementById("captureBtn"),
	            document.getElementById("closeModal")
	        ];
	        
	        elementsToHide.forEach(el => el.style.display = "none");
	
	        // 이미지가 로딩될 때까지 대기
	        const images = captureTarget.querySelectorAll("img");
	        await Promise.all(Array.from(images).map(img => ensureImageLoaded(img)));
	        
	        // dom-to-image-more로 캡처
	        const dataUrl = await domtoimage.toPng(captureTarget, {
	            quality: 1, // 최고 품질
	            width: captureTarget.offsetWidth,
	            height: captureTarget.scrollHeight,
	            style: {
	                transform: "scale1(1)", // 스케일을 2배로
	                transformOrigin: "top left", // 변환 기준 설정
	                backgroundColor: "#FFFFFF" // 하얀 배경 설정
	            }
	        });
	
	        // 데이터 URL을 Blob으로 변환 후 클립보드에 복사
	        const blob = await (await fetch(dataUrl)).blob();
	        await navigator.clipboard.write([
	            new ClipboardItem({ "image/png": blob })
	        ]);
	
	        alert("클립보드에 이미지가 복사되었습니다!");
	
	        // 숨겼던 요소 복원
	        elementsToHide.forEach(el => el.style.display = "");
	
	    } catch (err) {
	        console.error("캡처 실패:", err);
	        alert("캡처에 실패했습니다.");
	    }
	});
	// 이미지 로드 대기 함수
	function ensureImageLoaded(img) {
	    return new Promise((resolve, reject) => {
	        if (img.complete) {
	            resolve();
	        } else {
	            img.onload = resolve;
	            img.onerror = reject;
	        }
	    });
	}
	*/
	// 이미지 로드 대기 함수
	async function ensureImageLoaded(img) {
	    if (img.complete) return;
	    return new Promise((resolve, reject) => {
	        img.onload = resolve;
	        img.onerror = reject;
	    });
	}
	
	// 캡처 로직 (모달 내용을 이미지로 캡처)
	async function captureImage() {
	    const captureTarget = document.querySelector(".modal-content");
	
	    // 레이아웃 렌더링 완료 대기
	    await new Promise((resolve) => requestAnimationFrame(resolve));
	
	    const elementsToHide = [
	        document.getElementById("captureBtn"),
	        document.getElementById("captureSaveBtn"),
	        document.getElementById("closeModal")
	        
	    ];
	
	    // 숨길 요소 임시로 숨기기
	    elementsToHide.forEach(el => el.style.display = "none");
	
	    // 이미지 로드 대기
	    const images = captureTarget.querySelectorAll("img");
	    await Promise.all(Array.from(images).map(img => ensureImageLoaded(img)));
	
	    // dom-to-image-more로 캡처
	    const dataUrl = await domtoimage.toPng(captureTarget, {
	        quality: 1,
	        width: captureTarget.offsetWidth,
	        height: captureTarget.scrollHeight,
	        style: {
	            transform: "scale(1)",
	            transformOrigin: "top left",
	            backgroundColor: "#FFFFFF"
	        }
	    });
	
	    // 숨긴 요소 복원
	    elementsToHide.forEach(el => el.style.display = "");
	
	    return dataUrl;
	}
	
	// 클립보드에 이미지 복사
	document.getElementById("captureBtn").addEventListener("click", async () => {
	    try {
	        const dataUrl = await captureImage();
	        const blob = await (await fetch(dataUrl)).blob();
	
	        await navigator.clipboard.write([new ClipboardItem({ "image/png": blob })]);
	        alert("클립보드에 이미지가 복사되었습니다!");
	    } catch (err) {
	        console.error("클립보드 복사 실패:", err);
	        alert("복사에 실패했습니다.");
	    }
	});
	
	// 이미지 파일로 저장 (iOS/Safari 호환)
	document.getElementById("captureSaveBtn").addEventListener("click", async () => {
	    try {
	        const dataUrl = await captureImage();
	        const fileName = generateFileName();
	        saveImage(dataUrl, fileName);
	    } catch (err) {
	        console.error("이미지 저장 실패:", err);
	        alert("저장에 실패했습니다.");
	    }
	});
	
	// 이미지 저장 함수
	function saveImage(dataUrl, fileName) {
	    const link = document.createElement("a");
	    link.href = dataUrl;
	    link.download = fileName;
	
	    // iOS/Safari 감지 및 처리
	    if (isIOS()) {
	        alert("이미지를 길게 눌러 저장하세요.");
	        window.open(dataUrl, "_blank");
	    } else {
	        document.body.appendChild(link);
	        link.click();
	        document.body.removeChild(link);
	    }
	}
	
	// iOS 또는 Safari 감지 함수
	function isIOS() {
	    return /iP(hone|ad|od)/i.test(navigator.userAgent) ||
	           (navigator.userAgent.includes("Mac") && "ontouchend" in document);
	}
	
	// 날짜 및 시간 형식 포맷 함수
	function getCurrentFormattedTime() {
	    const now = new Date();
	    const yy = String(now.getFullYear()).slice(-2);
	    const mm = String(now.getMonth() + 1).padStart(2, '0'); // 월 (01-12)
	    const dd = String(now.getDate()).padStart(2, '0');      // 일 (01-31)
	    const hh = String(now.getHours()).padStart(2, '0');     // 시 (00-23)
	    const min = String(now.getMinutes()).padStart(2, '0');  // 분 (00-59)
	
	    return `${yy}${mm}${dd}-${hh}${min}`;
	}
	
	// 여러 hex 값 가져와 결합하는 함수
	function getHexValues() {
	     const hexLabels = document.querySelectorAll("#modalItemColors .color-info label.hex" );
	    const hexValues = Array.from(hexLabels).map(label => label.innerText.trim().replace("#", ""));
	    return hexValues.join("N"); // N으로 결합
	}
	
	// 파일명 생성 함수
	function generateFileName() {
	    // modalItemName 텍스트 가져오기
	    const itemName = document.getElementById("modalItemName").innerText.trim();
	
	    // hex 값 결합
	    const hexValues = getHexValues();
	
	    // 현재 시간 가져오기
	    const currentTime = getCurrentFormattedTime();
	
	    // 파일명 조합
	    return `${itemName}-${currentTime}-${hexValues}.png`;
	}
	
	async function singleChanneling(e) {
		const elem = e.currentTarget;
		const item = elem.closest(".item");  // 해당 img-area가 속한 .item 요소 찾기
		const item_name = item.querySelector(".item_nm").innerText;
		Swal.fire({
		  title: `${item_name} 기준으로 검색합니다.`,
		  showDenyButton: true,
		  showCancelButton: true,
		  confirmButtonText: "현재 서버",
		  denyButtonText: `전체 서버`
		}).then(async  (result) => {
			if( !result.isDismissed ){
				
		        const img = elem.querySelector(".api-img");
		        const qCode = img.getAttribute("data-qcode");  // 아이템 코드 가져오기
		        const location = item.querySelector(".location_nm");
		        const npc = location.getAttribute("data-key");  // 선택한 서버 가져오기
		        let all = false;
		        
		        if ( !result.isConfirmed ) all = true;
		        
				try {
			        // 로딩 오버레이 표시
			        showLoadingOverlay();
			
			        // API로 데이터 가져오기
			        const data = await getAllServersForItem(npc, qCode, all);	
			        if (!data) return;
			        
			        // 초기화: right-layout 내부의 기존 세트 및 채널 정보 제거
					updateModalTime();
					
			        // 지역 이름 설정
			        const locationName = location.textContent;
			        modalItemName.textContent = locationName;       
			
			        // 이미지 설정
			        const apiImageSrc = item.querySelector(".api-img").src;
			        let mabibaseImageSrc = item.querySelector(".mabibase-img").src;
			       
			        modalApiImage.src = apiImageSrc;
			        modalMabibaseImage.src = mabibaseImageSrc;	        
			        
			        // 복제된 이미지에 동일한 경로 설정
			        modalMabibaseImageCopy.src = mabibaseImageSrc;
			
			        // 색상 정보 추가
			        const colorInfo = item.querySelector(".color-info");
			        if (colorInfo) {
			            modalItemColors.innerHTML = colorInfo.outerHTML;
			        } else {
			            console.warn("색상 정보가 없습니다.");
			        }	        
			        // 모달에 데이터 표시
			        showChannelingModal(data, location.innerText);
			    } catch (error) {
			        console.error("채널링 중 에러 발생:", error);
			        initializeModal();
			    } finally {
			        // 로딩 오버레이 숨김
			        hideLoadingOverlay();
			    }
		    }
	    });
	}
	async function getAllServersForItem(npc, qCode, all) {
	    const itemKey = removeBetweenMarkers(qCode); // 클릭된 이미지 URL에서 key 값 추출
	    let servers = [document.getElementById("server").value];
	    if (!itemKey) {
	        console.error("아이템 qCode를 추출할 수 없습니다.");
	        return {};
	    }
	    
		if (all) {
	        servers = Object.keys(server_ch); // 모든 서버 목록 가져오기
	        maxCompleteCnt = allServerChannelCount();
	    } else {
	        maxCompleteCnt = server_ch[servers[0]] - 1;
	    }
	    
	    const groupedItems = {}; // 서버와 채널 정보를 그룹화할 객체
	    // 모든 서버와 채널에 대해 fetchNpcData 호출
	    completeCnt = 0;
	    outerLoop:  // 레이블을 사용하여 외부 반복문까지 탈출할 수 있게 설정
	    for (const server of servers) {
	        const maxCh = server_ch[server]; // 해당 서버의 최대 채널 수
	
	        for (let ch = 1; ch <= maxCh; ch++) {
	            if (ch === 11) continue; // 11채널 제외
	
	            const data = await fetchNpcData(npc, server, ch); // CPN과 서버, 채널로 API 호출	    
	            
	            if (data.error) {
	                console.error(`Error fetching data for ${server} - ${ch}: ${data.error}`);
	                break outerLoop;
	            }
	
	            // 아이템의 이미지 URL에서 key 값을 추출하여 매칭
	            data.forEach(item => {
	                const itemQValue = extractQValue(item.image_url); // API 데이터의 이미지 URL에서 key 추출
	
	                if (itemQValue !== itemKey) return; // key 값이 일치하지 않으면 건너뜀
	
	                // 그룹화하여 저장
	                if (!groupedItems[itemQValue]) groupedItems[itemQValue] = {};
	
	                if (!groupedItems[itemQValue][item.item_display_name]) {
	                    groupedItems[itemQValue][item.item_display_name] = {
	                        servers: {},
	                        item_data: item,
	                    };
	                }
	
	                if (!groupedItems[itemQValue][item.item_display_name].servers[server]) {
	                    groupedItems[itemQValue][item.item_display_name].servers[server] = [];
	                }
	
	                // 채널 추가
	                if (
	                    !groupedItems[itemQValue][item.item_display_name].servers[server].includes(
	                        ch
	                    )
	                ) {
	                    groupedItems[itemQValue][item.item_display_name].servers[server].push(ch);
	                }
	            });
	        }
	    }
	    return groupedItems; // 모든 서버와 채널에 대한 데이터를 반환
	}

	function showChannelingModal(data, itemName) {
	    // 기존 내용 초기화
	    //channelInfoDiv.innerHTML = "";
	
	    // 모달의 제목에 아이템 이름 설정
	    document.getElementById("modalItemName").innerText = itemName;
	
	    // 채널 정보가 없을 때 처리
	    if (data.length === 0) {
	        channelInfoDiv.innerHTML = "<p>해당 아이템의 채널 정보를 찾을 수 없습니다.</p>";
	    } else {
			const sortedItems = sortGroupedItems(data);		
	        const matchedItemGroup = sortedItems[Object.keys(sortedItems)[0]];

	 		createChannelInfoDiv(matchedItemGroup, true)
             .then(({ div: channelInfoDiv, data: itemDataList }) => {		        
		        rightLayout.appendChild(channelInfoDiv); // 채널 정보 추가
		        
		        // 추가 작업이 필요하다면 여기서 itemDataList를 활용
		        populateImageListSample(itemDataList); 
		    })
		    .catch((error) => {
		        console.error("채널 정보를 생성하는 도중 오류가 발생했습니다:", error);
		    });

	    }
	
	    // 모달 표시
	    modal.style.display = "flex";
	}
	
	function createChannelInfoItem(itemName, servers) {
	    const itemDiv = document.createElement("div");
	    itemDiv.classList.add("channel-info-item");
	
	    let serverInfoHTML = "";
	    for (const [serverName, channels] of Object.entries(servers)) {
	        const channelsStr = channels.join(", ");
	        serverInfoHTML += `
	            <span class="info-channel all-server" data-server="${serverName}">
	                <label class="server-mark ${serverName}"></label>
	                ${channelsStr}
	            </span>`;
	    }
	
	    itemDiv.innerHTML = `
	        <span class="info-jumoney-name">${itemName}</span>
	        ${serverInfoHTML}
	    `;
	    return itemDiv;
	}
	
	// 모달 닫기 이벤트
	document.getElementById("closeModal").addEventListener("click", () => {
	    document.getElementById("itemModal").style.display = "none";
	});

	
    closeModalButton.addEventListener("click", function () {
        modal.style.display = "none";
		initializeModal();
    });

    modal.addEventListener("click", function (event) {
        if (event.target === modal) {
			initializeModal()
            modal.style.display = "none";
        }
    });
	 
	document.getElementById("checkSet").addEventListener("click", () => { checkSetAllServers(false);});
	document.getElementById("checkAllServers").addEventListener("click", () => { checkSetAllServers(true);});	 
});

