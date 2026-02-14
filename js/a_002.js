
 	const setDefinitions = {
      작물셋: ["튼튼한 달걀 주머니", "튼튼한 감자 주머니", "튼튼한 옥수수 주머니", "튼튼한 밀 주머니", "튼튼한 보리 주머니"],
      방직셋: ["튼튼한 양털 주머니", "튼튼한 거미줄 주머니", "튼튼한 가는 실뭉치 주머니", "튼튼한 굵은 실뭉치 주머니"],
      가죽셋: ["튼튼한 저가형 가죽 주머니", "튼튼한 일반 가죽 주머니", "튼튼한 고급 가죽 주머니", "튼튼한 최고급 가죽 주머니"],
      옷감셋: ["튼튼한 저가형 옷감 주머니", "튼튼한 일반 옷감 주머니", "튼튼한 고급 옷감 주머니", "튼튼한 최고급 옷감 주머니"],
      실크셋: ["튼튼한 저가형 실크 주머니", "튼튼한 일반 실크 주머니", "튼튼한 고급 실크 주머니", "튼튼한 최고급 실크 주머니", "튼튼한 꽃바구니"],
      허브셋O: ["튼튼한 블러디 허브 주머니", "튼튼한 마나 허브 주머니", "튼튼한 선라이트 허브 주머니", "튼튼한 베이스 허브 주머니", "튼튼한 만드레이크 주머니"],
      허브셋N: ["튼튼한 골드 허브 주머니", "튼튼한 못쓰게 된 허브 주머니", "튼튼한 화이트 허브 주머니", "튼튼한 해독초 주머니", "튼튼한 포이즌 허브 주머니"],
      더헙셋O: ["더 튼튼한 블러디 허브 주머니", "더 튼튼한 마나 허브 주머니", "더 튼튼한 선라이트 허브 주머니", "더 튼튼한 베이스 허브 주머니", "더 튼튼한 만드레이크 주머니"],
      더헙셋N: ["더 튼튼한 골드 허브 주머니", "더 튼튼한 못쓰게 된 허브 주머니", "더 튼튼한 화이트 허브 주머니", "더 튼튼한 해독초 주머니", "더 튼튼한 포이즌 허브 주머니"],
      기타: ["자브키엘의 악보집"]
    };
    
	function parseColorInput(color) {
	  // HEX 색상 포맷인지 확인
	  if (/^#([0-9A-Fa-f]{3}){1,2}$/.test(color)) {
	    return color; // HEX 포맷 그대로 반환
	  }
	
	  // RGB 색상 포맷을 여러 구분자로 구분하여 처리
	  const rgbMatch = color.match(/^(\d{1,3})[ ,./]+(\d{1,3})[ ,./]+(\d{1,3})$/);
	  if (rgbMatch) {
	    const [_, r, g, b] = rgbMatch;
	    if (r <= 255 && g <= 255 && b <= 255) {
	      // RGB 포맷을 HEX로 변환
	      return `#${((1 << 24) + (+r << 16) + (+g << 8) + +b).toString(16).slice(1)}`;
	    }
	  }
	
	  // 유효하지 않은 색상 입력일 경우 기본값 반환
	  return '#FFFFFF';
	}
	
	// 색상을 적용하는 함수

	async function applyColors() {
	  const colorA = parseColorInput(document.getElementById('colorA').value || "#ffffff");
	  const colorB = parseColorInput(document.getElementById('colorB').value || "#ffffff");
	  const colorC_crop_textile = parseColorInput(document.getElementById('colorC_crop_textile').value || "#ffffff");
	  const colorC_other = parseColorInput(document.getElementById('colorC_other').value || "#ffffff");
	  
	  displayJumoneyImages(colorA, colorB, colorC_crop_textile, colorC_other);
	}
	/*	
   async function applyColors() {
      const colorA = document.getElementById('colorA').value || "#ffffff";
      const colorB = document.getElementById('colorB').value || "#ffffff";
      const colorC_crop_textile = document.getElementById('colorC_crop_textile').value || "#ffffff";
      const colorC_other = document.getElementById('colorC_other').value || "#ffffff";

      displayJumoneyImages(colorA, colorB, colorC_crop_textile, colorC_other);
    }
*/
    async function displayJumoneyImages(colorA, colorB, colorC_crop_textile, colorC_other) {
      const container = document.getElementById('jumoneyContainer');
      container.innerHTML = '';

	  const setText = document.createElement("label");
	  setText.className = "set-alert";
      container.appendChild(setText);
      
      for (const [setName, items] of Object.entries(setDefinitions)) {
		  let setContainerClose, setContainerOpen, setContainerEtc = null;
		  switch (setName) {
			  case "기타":
				  setContainerEtc = document.createElement("div");
				  setContainerEtc.className = "set-container";

				  container.appendChild(setContainerEtc);
				  break;
			  default:
				  setContainerClose = document.createElement("div");
				  setContainerClose.className = "set-container";

				  setContainerOpen = document.createElement("div");
				  setContainerOpen.className = "set-container";

				  container.appendChild(setContainerClose);
				  container.appendChild(setContainerOpen);
				  break;
		  }       
        
        setText.style.display = "inline";
        setText.style.margin = "0px 0px 10px";
        setText.innerText = "하단의 이미지를 드래그 하여 주머니 수배지의 + 칸에 옮기세요";

        //const setTitle = document.createElement("h2");
        //setTitle.innerHTML = `${setName}`;
        //container.appendChild(setTitle);

        const colorC = (setName === "작물셋" || setName === "방직셋" || setName === "기타") ? colorC_crop_textile : colorC_other;

        for (const itemName of items) {
          try {
			  switch (setName) {
				  case "기타":
					  const etcImageUrl = await createJumoneyImage(itemName, [colorA, colorB, colorC], "etc");
					  const etcItemContainer = createImageContainer(itemName, etcImageUrl, "etc");
					  setContainerEtc.appendChild(etcItemContainer);
					  break;
				  default:
					  const closeImageUrl = await createJumoneyImage(itemName, [colorA, colorB, colorC], "close");
					  const closeItemContainer = createImageContainer(itemName, closeImageUrl, "close");
					  setContainerClose.appendChild(closeItemContainer);

					  const openImageUrl = await createJumoneyImage(itemName, [colorA, colorB, colorC], "open");
					  const openItemContainer = createImageContainer(itemName, openImageUrl, "open");
					  setContainerOpen.appendChild(openItemContainer);
					  break;
			  }  
          } catch (error) {
            console.error(`이미지 생성 실패 ${itemName}:`, error);
          }
        }
        setDragEvent();
      }
    }

    function createImageContainer(itemName, imageUrl, type) {
      const itemContainer = document.createElement("div");
      itemContainer.className = "jumoney-item";
      itemContainer.innerHTML = `
        <h3>${itemName} (${type})</h3>
        <img src="${imageUrl}" data-type="${type}" data-name="${itemName}" alt="${itemName} ${type}">
      `;
      return itemContainer;
    }

    async function saveAllImages() {
      const zip = new JSZip();
      const scale = parseInt(document.getElementById('scaleSelect').value);
      const images = document.querySelectorAll('.jumoney-item img');

      for (const img of images) {
        const itemName = img.getAttribute('data-name');
        const type = img.getAttribute('data-type');
        
        const canvas = document.createElement('canvas');
        canvas.width = img.naturalWidth * scale;
        canvas.height = img.naturalHeight * scale;
        const ctx = canvas.getContext('2d', { alpha: true });
        ctx.imageSmoothingEnabled = false;
        ctx.scale(scale, scale);
        ctx.drawImage(img, 0, 0);
        
        const dataUrl = canvas.toDataURL('image/png');
        zip.file(`${itemName}_${type}.png`, dataUrl.split(',')[1], { base64: true });
      }

      const zipBlob = await zip.generateAsync({ type: 'blob' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(zipBlob);
      link.download = `all_images.zip`;
      link.click();
    }

    async function saveSetImages() {
      const setName = document.getElementById('setSelect').value;
      const type = document.getElementById('typeSelect').value;
      const zip = new JSZip();
      const scale = parseInt(document.getElementById('scaleSelect').value);

      const images = Array.from(document.querySelectorAll(`.jumoney-item img[data-name][data-type]`))
        .filter(img => setDefinitions[setName].includes(img.getAttribute('data-name')) && (type === "all" || img.getAttribute('data-type') === type));

      for (const img of images) {
        const itemName = img.getAttribute('data-name');
        const itemType = img.getAttribute('data-type');
        
        const canvas = document.createElement('canvas');
        canvas.width = img.naturalWidth * scale;
        canvas.height = img.naturalHeight * scale;
        const ctx = canvas.getContext('2d', { alpha: true });
        ctx.imageSmoothingEnabled = false;
        ctx.scale(scale, scale);
        ctx.drawImage(img, 0, 0);

        const dataUrl = canvas.toDataURL('image/png');
        zip.file(`${itemName}_${itemType}.png`, dataUrl.split(',')[1], { base64: true });
      }

      const zipBlob = await zip.generateAsync({ type: 'blob' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(zipBlob);
      link.download = `${setName}_${type}_images.zip`;
      link.click();
    }

    async function saveAllMergedImages() {
      const scale = parseInt(document.getElementById('scaleSelect').value);
      const bgColor = document.getElementById('bgColorSelect').value;
      const bgOpacity = parseFloat(document.getElementById('bgOpacity').value);
      const sets = document.querySelectorAll('.set-container');

      const setHeights = Array.from(sets).map(set => Math.max(...Array.from(set.children).map(item => item.querySelector('img').naturalHeight * scale)));
      const totalHeight = setHeights.reduce((sum, height) => sum + height, 0);
      const maxWidth = Math.max(...Array.from(sets).map(set => Array.from(set.children).reduce((sum, item) => sum + item.querySelector('img').naturalWidth * scale, 0)));

      const canvas = document.createElement('canvas');
      canvas.width = maxWidth;
      canvas.height = totalHeight;
      const ctx = canvas.getContext('2d', { alpha: true });
      ctx.imageSmoothingEnabled = false;

      ctx.fillStyle = hexToRgba(bgColor, bgOpacity);
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      let yOffset = 0;
      for (let i = 0; i < sets.length; i++) {
        const set = sets[i];
        let xOffset = 0;
        const setHeight = setHeights[i];
        
        for (const item of set.children) {
          const img = item.querySelector('img');
          ctx.drawImage(img, xOffset, yOffset, img.naturalWidth * scale, img.naturalHeight * scale);
          xOffset += img.naturalWidth * scale;
        }
        
        yOffset += setHeight;
      }

      const link = document.createElement('a');
      link.href = canvas.toDataURL('image/png');
      link.download = `all_sets_merged.png`;
      link.click();
    }

    async function saveMergedSetImages() {
      const setName = document.getElementById('setSelect').value;
      const type = document.getElementById('typeSelect').value;
      const scale = parseInt(document.getElementById('scaleSelect').value);
      const bgColor = document.getElementById('bgColorSelect').value;
      const bgOpacity = parseFloat(document.getElementById('bgOpacity').value);
      const setCount = Object.keys(setDefinitions[setName]).length;

      const images = Array.from(document.querySelectorAll(`.jumoney-item img[data-name][data-type]`))
        .filter(img => setDefinitions[setName].includes(img.getAttribute('data-name')) && (type === "all" || img.getAttribute('data-type') === type));

      const rows = Math.ceil(images.length / setCount); // 가로 최대 setCount개로 배열
      const maxWidth = Math.max(...images.map(img => img.naturalWidth * scale)) * setCount;
      const maxHeight = images[0].naturalHeight * scale * rows + 5;

      const canvas = document.createElement('canvas');
      canvas.width = maxWidth;
      canvas.height = maxHeight;
      const ctx = canvas.getContext('2d', { alpha: true });
      ctx.imageSmoothingEnabled = false;

      ctx.fillStyle = hexToRgba(bgColor, bgOpacity);
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      let xOffset = 0;
      let yOffset = 0;
      images.forEach((img, index) => {
        if (index > 0 && index % setCount === 0) { // setCount개 단위로 줄바꿈
          yOffset += img.naturalHeight * scale;
          xOffset = 0;
        }
        ctx.drawImage(img, xOffset, yOffset, img.naturalWidth * scale, img.naturalHeight * scale);
        xOffset += img.naturalWidth * scale;
      });

      const link = document.createElement('a');
      link.href = canvas.toDataURL('image/png');
      link.download = `${setName}_${type}_merged.png`;
      link.click();
    }

    function hexToRgba(hex, opacity) {
      const bigint = parseInt(hex.slice(1), 16);
      const r = (bigint >> 16) & 255;
      const g = (bigint >> 8) & 255;
      const b = bigint & 255;
      return `rgba(${r}, ${g}, ${b}, ${opacity})`;
    }
    /*
	function setDragEvent() {
		// 드래그 기능 추가
		document.querySelectorAll('.jumoney-item img').forEach((img) => {
			img.setAttribute('draggable', true);
			img.addEventListener('dragstart', (event) => {
				const data = `${img.src}||${img.alt}`; // 구분자로 src와 alt 결합
				event.dataTransfer.setData('text/plain', img.src);
				event.dataTransfer.setData('alt', img.alt);
			});
		});
	
		document.querySelectorAll('.small-box, .large-box').forEach((box) => {
			box.addEventListener('dragover', (event) => {
				event.preventDefault();
			});
	
			box.addEventListener('drop', (event) => {
				event.preventDefault();
				const data = event.dataTransfer.getData('text/plain');
				const imgSrc = event.dataTransfer.getData('text/plain');
				const imgAlt = event.dataTransfer.getData('alt');
	
				//const [imgSrc, imgAlt] = data.split('||'); // 구분자로 분리하여 src와 alt 추출
				const img = document.createElement('img');
				img.src = imgSrc;
				img.alt = imgAlt;
	
				// 조건에 따른 크기 설정
				if (box.classList.contains('small-box')) {
					img.style.width = "100%";
				} else if (box.classList.contains('large-box')) {
					img.style.width = "calc(100% - 2px)";
				}
	
				img.style.height = "auto"; // 높이는 자동 조절
				box.innerHTML = ''; // 이전 내용을 지우고 새로운 이미지를 추가
				box.appendChild(img);
			});
		});
	}
 	*/
function setDragEvent() {
  const BOX_SEL = '.small-box, .large-box';
  let draggingImg = null;      // 드래그 중인 원본 IMG 노드
  let draggingFromBox = null;  // 드래그 시작한 박스(팔레트면 null)
  let selectedBox = null;

  // ---------- 유틸 ----------
  function getBoxImgInfo(box){
    const img = box.querySelector('img');
    return {
      has: !!img,
      img,
      src: img ? (img.getAttribute('src') || '') : '',
      alt: img ? (img.getAttribute('alt') || '') : ''
    };
  }

  function setBoxImage(box, src, alt){
    box.innerHTML = '';
    const img = document.createElement('img');
    img.src = src;
    img.alt = alt || '';
    if (box.classList.contains('small-box')) img.style.width = '100%';
    else if (box.classList.contains('large-box')) img.style.width = 'calc(100% - 2px)';
    img.style.height = 'auto';
    box.appendChild(img);
    makeContainerImgDraggable(img);
  }

  function clearBox(box){
    box.innerHTML = '';
    const plus = document.createElement('span');
    plus.className = 'null_';
    plus.textContent = '+';
    box.appendChild(plus);
  }

  function setSelected(box){
    document.querySelectorAll(BOX_SEL).forEach(b => {
      b.classList.remove("select-box");
    });
    selectedBox = null;
    if (box) {
	  box.classList.add("select-box");
      selectedBox = box;
    }
  }

  function makeContainerImgDraggable(img){
    if (img.getAttribute('data-enhanced') === '1') return;
    img.setAttribute('data-enhanced', '1');
    img.setAttribute('draggable', 'true');
    img.addEventListener('dragstart', (e) => {
      draggingImg = img;
      draggingFromBox = img.closest(BOX_SEL);
      // dataTransfer는 보조(없어도 draggingImg로 처리)
      e.dataTransfer.setData('text/plain', img.src);
      e.dataTransfer.setData('alt', img.alt || '');
      try { e.dataTransfer.setDragImage(img, img.width/2, img.height/2); } catch(_) {}
    });
    img.addEventListener('dragend', () => {
      draggingImg = null;
      draggingFromBox = null;
    });
  }
  // ---------- /유틸 ----------

  // 1) 팔레트 이미지(기존 기능)
  document.querySelectorAll('.jumoney-item img').forEach((img) => {
    img.setAttribute('draggable', true);
    img.addEventListener('dragstart', (event) => {
      draggingImg = img;          // 기존 src를 그대로 쓰기 위함
      draggingFromBox = null;     // 팔레트는 박스가 아님
      event.dataTransfer.setData('text/plain', img.src);
      event.dataTransfer.setData('alt', img.alt || '');
      try { event.dataTransfer.setDragImage(img, img.width/2, img.height/2); } catch(_) {}
    });
    img.addEventListener('dragend', () => {
      draggingImg = null;
      draggingFromBox = null;
    });
  });

  // 2) 컨테이너 박스
  document.querySelectorAll(BOX_SEL).forEach((box) => {
    box.addEventListener('dragover', (e) => e.preventDefault());

    box.addEventListener('drop', (e) => {
      e.preventDefault();

      // 드래그 원본의 “기존 src/alt” 확보
      let src = '', alt = '';
      if (draggingImg) {
        src = draggingImg.src;
        alt = draggingImg.alt || '';
      } else {
        // 외부/예외 대비 보조
        src = e.dataTransfer.getData('text/plain') || '';
        alt = e.dataTransfer.getData('alt') || '';
      }
      if (!src) return;

      // 내부 이동(컨테이너→컨테이너)
      if (draggingFromBox && draggingFromBox !== box) {
        const fromInfo = getBoxImgInfo(draggingFromBox); // 원본 박스 현재 상태
        const toInfo   = getBoxImgInfo(box);             // 타깃 박스 현재 상태

        // 먼저 두 박스의 현 상태를 모두 백업한 뒤 교체/비우기
        // 드롭 대상에는 드래그한 이미지(src/alt) 배치
        setBoxImage(box, src, alt);

        if (toInfo.has) {
          // 스왑: 타깃에 있던 이미지를 원본 박스로
          setBoxImage(draggingFromBox, toInfo.src, toInfo.alt);
        } else {
          // 단순 이동: 원본 박스 비우기
          clearBox(draggingFromBox);
        }

        setSelected(box);
        return;
      }

      // 팔레트 → 박스: 그냥 배치
      setBoxImage(box, src, alt);
      setSelected(box);
    });

    // 선택(Del 키 삭제용)
    box.addEventListener('click', () => {
      if (box.querySelector('img')) setSelected(box);
      else setSelected(null);
    });

    // 우클릭 삭제
    box.addEventListener('contextmenu', (e) => {
      if (!box.querySelector('img')) return;
      e.preventDefault();
      clearBox(box);
      setSelected(null);
    });

    // 더블클릭 삭제
    box.addEventListener('dblclick', () => {
      if (!box.querySelector('img')) return;
      clearBox(box);
      setSelected(null);
    });
  });

  // 3) 초기 로드 시 박스 내 이미지도 드래그 가능
  document.querySelectorAll(BOX_SEL + ' img').forEach(makeContainerImgDraggable);

  // 4) Delete 키로 삭제
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Delete' && selectedBox) {
      clearBox(selectedBox);
      setSelected(null);
    }
  });
}

	async function saveContainerAsSVGImage() {
	  const container = document.getElementById('container');

	  // 모든 폰트가 로드될 때까지 기다린 후 이미지 생성
	  document.fonts.ready.then(() => {
	    domtoimage.toPng(container, {
	      quality: 1, // 이미지 품질 설정 (1 = 최고)
	      style: {
	        'image-rendering': 'pixelated'
	      }
	    })
	    .then((dataUrl) => {	      
	      const link = document.createElement('a');
	      link.href = dataUrl;
	      link.download = 'My-jumoney.png';
	      link.click();
	    })
	    .catch((error) => {
	      console.error('이미지 생성 오류:', error);
	    });
	  });
	}
	
	async function saveContainerAsSVGImage2() {
		const container = document.getElementById('container');
		const fontName = "MabinogiClassicR";
	
		// 폰트가 로드된 상태인지 확인
		const isFontLoaded = document.fonts.check(`1em ${fontName}`);
		// 빈 칸 + 모양 지움
		document.querySelectorAll('.null_').forEach(el => el.style.display = 'none');
		container.classList.add("mode-save");
		
		// 모든 폰트가 로드될 때까지 기다린 후 이미지 생성
		await document.fonts.ready;
	
		domtoimage.toPng(container, {
			quality: 1, // 이미지 품질 설정 (1 = 최고)
			style: {
				'image-rendering': 'pixelated',
			}
		})
			.then((dataUrl) => {
				const link = document.createElement('a');
				link.href = dataUrl;
				link.download = 'container-image.png';
				link.click();
				document.querySelectorAll('.null_').forEach(el => el.style.display = '');
				container.classList.remove("mode-save");
			})
			.catch((error) => {
				console.error('SVG 이미지 생성 오류:', error);
				container.classList.remove("mode-save");
			});
	}
	

 document.addEventListener("DOMContentLoaded", function () {
	/*
    const workspace = document.getElementById('workspace');
    const stickers = document.querySelectorAll('.jumoney-item img');
    let selectedImg = null;

    stickers.forEach(sticker => {
        sticker.addEventListener('dragstart', (event) => {
            event.dataTransfer.setData('text/plain', event.target.src);
        });

        sticker.addEventListener('click', (event) => {
        	if (selectedImg === event.target) {
	            // 이미 선택된 이미지를 다시 클릭하면 선택 취소
	            selectedImg.style.outline = 'none';
	            selectedImg = null;
	        } else {
	            // 다른 이미지를 클릭하면 선택 변경
	            if (selectedImg) {
	                selectedImg.style.outline = 'none';
	            }
	            selectedImg = event.target;
	            selectedImg.style.outline = '2px solid blue';
	        }
        });
    });

    workspace.addEventListener('dragover', (event) => {
        event.preventDefault();
    });

    workspace.addEventListener('drop', (event) => {
        event.preventDefault();
        const imgSrc = event.dataTransfer.getData('text/plain');
        if (imgSrc) {
            const existingImg = Array.from(workspace.querySelectorAll('img')).find(img => img.src === imgSrc);
            if (existingImg) {
                // 이미지가 이미 workspace에 있는 경우 위치만 이동
                existingImg.style.left = `${event.offsetX - existingImg.width / 2}px`;
                existingImg.style.top = `${event.offsetY - existingImg.height / 2}px`;
            } else {
                // 이미지가 workspace에 없는 경우 새로 추가
                const newImg = document.createElement('img');
                newImg.src = imgSrc;
                newImg.className = 'jumoney-item';

                newImg.style.position = 'absolute';
                newImg.style.left = `${event.offsetX - newImg.width / 2}px`;
                newImg.style.top = `${event.offsetY - newImg.height / 2}px`;
                newImg.draggable = true;

                newImg.addEventListener('dragstart', (e) => {
                    e.dataTransfer.setData('text/plain', e.target.src);
                });

                newImg.addEventListener('click', (event) => {
                	if (selectedImg === event.target) {
	                    // 이미 선택된 이미지를 다시 클릭하면 선택 취소
	                    selectedImg.style.outline = 'none';
	                    selectedImg = null;
	                } else {
	                    // 다른 이미지를 클릭하면 선택 변경
	                    if (selectedImg) {
	                        selectedImg.style.outline = 'none';
	                    }
	                    selectedImg = event.target;
	                    selectedImg.style.outline = '2px solid blue';
	                }
                });

                workspace.appendChild(newImg);
            }
        }
    });

    // 방향키를 사용해 선택된 이미지 이동
    document.addEventListener('keydown', (event) => {
        if (selectedImg) {
            const step = 1;
            let left = parseInt(selectedImg.style.left, 10);
            let top = parseInt(selectedImg.style.top, 10);

            switch (event.key) {
                case 'ArrowUp':
                    selectedImg.style.top = `${top - step}px`;
                    break;
                case 'ArrowDown':
                    selectedImg.style.top = `${top + step}px`;
                    break;
                case 'ArrowLeft':
                    selectedImg.style.left = `${left - step}px`;
                    break;
                case 'ArrowRight':
                    selectedImg.style.left = `${left + step}px`;
                    break;
                case 'Delete':
                    // 선택된 이미지 삭제
                    workspace.removeChild(selectedImg);
                    selectedImg = null;
                    break;
            }
        }
    });
*/
// HTML 요소 참조

	// 컬러 피커 연동
	document.querySelectorAll(".color-rect").forEach((rect) => {
	  rect.addEventListener("click", (event) => {
	    const target = event.target.getAttribute("data-target");
	    const colorInput = document.querySelector(`input.color-input[data-target="${target}"]`);
	    
	    // 숨겨진 color input 클릭하여 컬러 피커 표시
	    colorInput.click();
	  });
	});
	
	// 컬러 변경 이벤트 핸들러
	document.querySelectorAll(".color-input").forEach((input) => {
	  input.addEventListener("input", (event) => {
	    const hex = event.target.value;
	    const rgb = hexToRgb(hex);
	    const target = event.target.getAttribute("data-target");
	
	    // 색상 업데이트
	    updateColorFields(target, hex, `${rgb.r} ${rgb.g} ${rgb.b}`);
	  });
	});
	
	  document.querySelectorAll(".color-rgb").forEach(input => {
		  // 입력 이벤트: 입력 중에는 처리하지 않음
		  input.addEventListener("input", (event) => {
		    const rgbInput = event.target.value.trim();
		    
		    // RGB 값을 추출하는 정규식 (숫자 사이에 / , . 또는 공백을 허용, 예: 153 215 1)
		    const rgbPattern = /^(\d{1,3})[\/.,\s]+(\d{1,3})[\/.,\s]+(\d{1,3})$/;
		    const match = rgbInput.match(rgbPattern);
		    
		    if (match) {
		      const r = parseInt(match[1]);
		      const g = parseInt(match[2]);
		      const b = parseInt(match[3]);

		      // 각 RGB 값이 0-255 사이인지 확인
		      if (r <= 255 && g <= 255 && b <= 255) {
		        // 유효한 RGB 값이라면 변환을 위해 키 입력 대기
		        event.target.dataset.rgbValid = JSON.stringify({ r, g, b });
		      } else {
		        delete event.target.dataset.rgbValid; // 유효하지 않은 값 제거
		      }
		    } else {
		      delete event.target.dataset.rgbValid; // 형식에 맞지 않으면 유효하지 않은 값 제거
		    }
		  });

		  // focusout 또는 Enter 시 최종 변환 처리
		  input.addEventListener("blur", applyColorChange);
		  input.addEventListener("keypress", (e) => {
		    if (e.key === 'Enter') {
		      applyColorChange(e);
		    }
		  });
		});
	  
	// 최종 변환을 적용하는 함수
	  function applyColorChange(event) {
	    const rgbData = event.target.dataset.rgbValid ? JSON.parse(event.target.dataset.rgbValid) : null;
	    if (rgbData) {
	      const { r, g, b } = rgbData;
	      const hex = rgbToHex(r, g, b);
	      
	      // data-target 속성을 이용하여 대상 식별
	      const target = event.target.closest(".colors").querySelector(".color-rect").getAttribute("data-target");

	      // 공백으로 구분된 형식 적용
	      updateColorFields(target, hex, `${r} ${g} ${b}`);
	    }
	  }

	  document.querySelectorAll(".color-hex").forEach(input => {
		  input.addEventListener("input", (event) => {
		    const hex = event.target.value;
		    if (/^#[0-9A-Fa-f]{6}$/.test(hex)) {
		      const rgb = hexToRgb(hex);

		      // target을 data-target에서 추출
		      const target = event.target
		        .closest(".colors")
		        .querySelector(".color-rect")
		        .getAttribute("data-target");
		      
		      updateColorFields(target, hex, `${rgb.r} ${rgb.g} ${rgb.b}`);
		    }
		  });
		});
	  
	  // HEX 값을 RGB로 변환하는 함수
	  function hexToRgb(hex) {
	    const bigint = parseInt(hex.slice(1), 16);
	    return {
	      r: (bigint >> 16) & 255,
	      g: (bigint >> 8) & 255,
	      b: bigint & 255
	    };
	  }

	// RGB 값을 HEX로 변환하는 함수
	function rgbToHex(r, g, b) {
	  return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).toUpperCase();
	}

	// 필드를 업데이트하는 함수
	function updateColorFields(target, hex, rgb) {	  
	  
	  if(target) {
		const colorRect = document.querySelector(`.color-rect[data-target="${target}"]`);
		const hexInput = colorRect.closest(".colors").querySelector(".color-hex");
	  	const rgbInput = document.querySelector(`#color-${target.toLowerCase()}`);
	  	// 색상 필드 업데이트
		rgbInput.value = rgb;
  	  	colorRect.style.backgroundColor = hex;
	  	hexInput.value = hex.toUpperCase();
	  }	  
	}
	
	 const borderColorPicker = document.getElementById("setBorderColor");
	 const container = document.querySelector(".container");
	
	  // input[type="color"] 값이 변경될 때 border-color 업데이트
	  borderColorPicker.addEventListener("input", (event) => {
	    const selectedColor = event.target.value;
	    container.style.borderColor = selectedColor;
	  });
});
/* =========================
   레이아웃 모드 & 인벤토리 퍼즐 (이동/삭제 강화)
   - 1칸 = inv.cell px (권장 24)
   - 팔레트→드롭 배치 + 배치 후 재드래그 이동 + 삭제(우클릭/버튼/Del키)
   ========================= */
let layoutMode = 'poster';

// 이름 정규화 (open/close 꼬리, 괄호, 공백)
function normalizeName(s){
  return String(s||'')
    .replace(/\s+\(open\)|\s+\(close\)/i,'')
    .replace(/[\(\)]/g,'')
    .replace(/\s+/g,' ')
    .trim()
    .toLowerCase();
}

// 칸 크기 테이블 (칸 단위)
const itemSizesRaw = {
  // 1x1 (24x24)
  "튼튼한 양털 주머니":[2,2],
  "튼튼한 거미줄 주머니":[4,4],
  "튼튼한 가는 실뭉치 주머니":[1,1],
  "튼튼한 굵은 실뭉치 주머니":[1,1],

  // 2x2 (48x48)
  "튼튼한 달걀 주머니":[2,2],
  "튼튼한 감자 주머니":[2,2],
  "튼튼한 옥수수 주머니":[2,2],
  "튼튼한 밀 주머니":[2,2],
  "튼튼한 보리 주머니":[2,2],
  "튼튼한 꽃바구니":[2,2],

  // 1x2 (24x48) — 허브류
  "튼튼한 블러디 허브 주머니":[1,2],
  "튼튼한 마나 허브 주머니":[1,2],
  "튼튼한 선라이트 허브 주머니":[1,2],
  "튼튼한 베이스 허브 주머니":[1,2],
  "튼튼한 만드레이크 주머니":[1,2],
  "더 튼튼한 블러디 허브 주머니":[1,2],
  "더 튼튼한 마나 허브 주머니":[1,2],
  "더 튼튼한 선라이트 허브 주머니":[1,2],
  "더 튼튼한 베이스 허브 주머니":[1,2],
  "더 튼튼한 만드레이크 주머니":[1,2],

  // 2x2 (가죽/옷감)
  "튼튼한 저가형 가죽 주머니":[2,2],
  "튼튼한 일반 가죽 주머니":[2,2],
  "튼튼한 고급 가죽 주머니":[2,2],
  "튼튼한 최고급 가죽 주머니":[2,2],
  "튼튼한 저가형 옷감 주머니":[2,2],
  "튼튼한 일반 옷감 주머니":[2,2],
  "튼튼한 고급 옷감 주머니":[2,2],
  "튼튼한 최고급 옷감 주머니":[2,2],
};
const itemSizes = {};
Object.keys(itemSizesRaw).forEach(k => itemSizes[normalizeName(k)] = itemSizesRaw[k]);

// 인벤토리 상태
const inv = { rows: 16, cols: 12, cell: 24, occ: [] }; // occ[y][x] = wrap 또는 false
let selectedInvItem = null;   // 선택(Del 키 삭제용)
let dragMoveItem = null;      // 인벤토리 내부 재배치 드래그 소스

function initLayoutSwitch() {
  const radios = document.querySelectorAll('input[name="layoutMode"]');
  const posterWrap = document.getElementById('posterWrap');
  const inventoryWrap = document.getElementById('inventoryWrap');

  radios.forEach(r => {
    r.addEventListener('change', e => {
      layoutMode = e.target.value;
      if (layoutMode === 'poster') {
        posterWrap.style.display = '';
        inventoryWrap.style.display = 'none';
      } else {
        posterWrap.style.display = 'none';
        inventoryWrap.style.display = '';
        buildInventory();
      }
    });
  });

  const btn = document.getElementById('invBuild');
  if (btn) {
    btn.addEventListener('click', () => {
      const cols = parseInt(document.getElementById('invCols').value || '12', 10);
      const rows = parseInt(document.getElementById('invRows').value || '16', 10);
      const cell = parseInt(document.getElementById('invCell').value || '24', 10);
      inv.cols = Math.max(2, Math.min(40, cols));
      inv.rows = Math.max(2, Math.min(40, rows));
      inv.cell = Math.max(12, Math.min(96, cell));
      buildInventory();
    });
  }

  // Del 키로 삭제
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Delete' && selectedInvItem && selectedInvItem.parentElement) {
      removeInventoryItem(selectedInvItem);
      selectedInvItem = null;
    }
  });
}

function buildInventory() {
  const grid = document.getElementById('invGrid');
  if (!grid) return;

  grid.style.setProperty('--cols', inv.cols);
  grid.style.setProperty('--rows', inv.rows);
  grid.style.setProperty('--cell', inv.cell + 'px');

  inv.occ = Array.from({ length: inv.rows }, () => Array(inv.cols).fill(false));
  grid.innerHTML = '';

  grid.addEventListener('dragover', (e) => { if (layoutMode === 'inventory') e.preventDefault(); });
  grid.addEventListener('drop', onInventoryDrop);
}

function onInventoryDrop(e) {
  if (layoutMode !== 'inventory') return;
  e.preventDefault();

  const grid = document.getElementById('invGrid');
  const rect = grid.getBoundingClientRect();
  const cx = Math.floor((e.clientX - rect.left) / inv.cell);
  const cy = Math.floor((e.clientY - rect.top) / inv.cell);

  // 1) 인벤토리 내부 이동인가?
  if (e.dataTransfer.types && e.dataTransfer.types.includes('text/inv-move')) {
    if (!dragMoveItem) return;
    const w = parseInt(dragMoveItem.dataset.w, 10);
    const h = parseInt(dragMoveItem.dataset.h, 10);

    // 기존 점유 잠시 해제된 상태이므로 새 자리 가능여부 판단
    const pos = findFirstFit(cx, cy, w, h);
    if (!pos) {
      // 못 놓으면 원래 자리 복구
      const ox = parseInt(dragMoveItem.dataset.gx, 10);
      const oy = parseInt(dragMoveItem.dataset.gy, 10);
      setOcc(ox, oy, w, h, dragMoveItem);
      placeWrapStyle(dragMoveItem, ox, oy, w, h);
    } else {
      // 새 자리로 이동
      setOcc(pos.x, pos.y, w, h, dragMoveItem);
      placeWrapStyle(dragMoveItem, pos.x, pos.y, w, h);
      dragMoveItem.dataset.gx = String(pos.x);
      dragMoveItem.dataset.gy = String(pos.y);
    }
    dragMoveItem = null;
    return;
  }

  // 2) 팔레트에서 새로 드롭
  const imgSrc = e.dataTransfer.getData('text/plain');
  const imgAlt = e.dataTransfer.getData('data-name');
  if (!imgSrc || !imgAlt) return;

  const nameNorm = normalizeName(imgAlt);
  const [w, h] = itemSizes[nameNorm] || [1,1];

  const pos = findFirstFit(cx, cy, w, h);
  if (!pos) {
    grid.classList.add('inv-deny');
    grid.addEventListener('animationend', () => grid.classList.remove('inv-deny'), { once: true });
    return;
  }
  createInventoryItem(grid, imgSrc, imgAlt, w, h, pos.x, pos.y);
}

// 배치 가능한지
function canPlace(x, y, w, h) {
  if (x < 0 || y < 0 || x + w > inv.cols || y + h > inv.rows) return false;
  for (let j = 0; j < h; j++) {
    for (let i = 0; i < w; i++) {
      if (inv.occ[y + j][x + i]) return false;
    }
  }
  return true;
}

// 클릭지점 인접 우선 탐색
function findFirstFit(cx, cy, w, h) {
  const order = [];
  for (let y = 0; y < inv.rows; y++) {
    for (let x = 0; x < inv.cols; x++) {
      order.push({ x, y, d: Math.abs(x - cx) + Math.abs(y - cy) });
    }
  }
  order.sort((a,b) => a.d - b.d);
  for (const p of order) if (canPlace(p.x, p.y, w, h)) return { x:p.x, y:p.y };
  return null;
}

// 점유 설정/해제 (wrap 또는 false 저장)
function setOcc(x, y, w, h, val) {
  for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) {
    inv.occ[y + j][x + i] = val;
  }
}

// 배치된 래퍼의 스타일 갱신
function placeWrapStyle(wrap, gx, gy, w, h) {
  wrap.style.left   = (gx * inv.cell) + 'px';
  wrap.style.top    = (gy * inv.cell) + 'px';
  wrap.style.width  = (w  * inv.cell - 2) + 'px';
  wrap.style.height = (h  * inv.cell - 2) + 'px';
  wrap.title = `${wrap.dataset.rawName} • ${w}x${h}칸 (${w*inv.cell}x${h*inv.cell}px)`;
}

// 인벤토리 아이템 생성
function createInventoryItem(grid, src, rawName, w, h, gx, gy) {
  const wrap = document.createElement('div');
  wrap.className = 'inv-item';
  wrap.dataset.rawName = rawName;
  wrap.dataset.w = String(w);
  wrap.dataset.h = String(h);
  wrap.dataset.gx = String(gx);
  wrap.dataset.gy = String(gy);

  placeWrapStyle(wrap, gx, gy, w, h);

  const img = document.createElement('img');
  img.src = src;
  img.alt = rawName;

  // 삭제 버튼
  const xbtn = document.createElement('button');
  xbtn.type = 'button';
  xbtn.className = 'inv-remove';
  xbtn.textContent = '×';
  xbtn.addEventListener('click', (ev) => {
    ev.stopPropagation();
    removeInventoryItem(wrap);
  });

  // 선택(Del 키용)
  wrap.addEventListener('click', (ev) => {
    ev.stopPropagation();
    if (selectedInvItem && selectedInvItem !== wrap) selectedInvItem.classList.remove('selected');
    selectedInvItem = wrap;
    wrap.classList.add('selected');
  });

  // 우클릭 삭제
  wrap.addEventListener('contextmenu', (ev) => {
    ev.preventDefault();
    removeInventoryItem(wrap);
  });

  // 재배치(드래그 이동)
  wrap.setAttribute('draggable', 'true');
  wrap.addEventListener('dragstart', (e) => {
    // 기존 점유 해제해 두고 이동 시도
    const ox = parseInt(wrap.dataset.gx, 10);
    const oy = parseInt(wrap.dataset.gy, 10);
    setOcc(ox, oy, w, h, false);

    dragMoveItem = wrap;
    e.dataTransfer.setData('text/inv-move', '1'); // 내부 이동 플래그
    // 파이어폭스 호환: 드래그 이미지 지정(선택사항)
    if (img) e.dataTransfer.setDragImage(img, img.width/2, img.height/2);
  });

  wrap.addEventListener('dragend', () => {
    // drop 안 되고 끝나면 원래 자리로 복구
    if (dragMoveItem === wrap) {
      const ox = parseInt(wrap.dataset.gx, 10);
      const oy = parseInt(wrap.dataset.gy, 10);
      const ww = parseInt(wrap.dataset.w, 10);
      const hh = parseInt(wrap.dataset.h, 10);
      setOcc(ox, oy, ww, hh, wrap);
      placeWrapStyle(wrap, ox, oy, ww, hh);
      dragMoveItem = null;
    }
  });

  wrap.appendChild(img);
  wrap.appendChild(xbtn);
  grid.appendChild(wrap);

  // 점유 반영
  setOcc(gx, gy, w, h, wrap);
}

// 제거 공통 처리
function removeInventoryItem(wrap) {
  const grid = document.getElementById('invGrid');
  if (!wrap || !grid.contains(wrap)) return;
  const gx = parseInt(wrap.dataset.gx, 10);
  const gy = parseInt(wrap.dataset.gy, 10);
  const w = parseInt(wrap.dataset.w, 10);
  const h = parseInt(wrap.dataset.h, 10);
  setOcc(gx, gy, w, h, false);
  grid.removeChild(wrap);
  if (selectedInvItem === wrap) selectedInvItem = null;
}

// 초기화 훅
document.addEventListener('DOMContentLoaded', () => { initLayoutSwitch(); });
