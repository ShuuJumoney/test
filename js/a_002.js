
 	const setDefinitions = {
      작물셋: ["튼튼한 달걀 주머니", "튼튼한 감자 주머니", "튼튼한 옥수수 주머니", "튼튼한 밀 주머니", "튼튼한 보리 주머니"],
      방직셋: ["튼튼한 양털 주머니", "튼튼한 거미줄 주머니", "튼튼한 가는 실뭉치 주머니", "튼튼한 굵은 실뭉치 주머니"],
      가죽셋: ["튼튼한 저가형 가죽 주머니", "튼튼한 일반 가죽 주머니", "튼튼한 고급 가죽 주머니", "튼튼한 최고급 가죽 주머니"],
      옷감셋: ["튼튼한 저가형 옷감 주머니", "튼튼한 일반 옷감 주머니", "튼튼한 고급 옷감 주머니", "튼튼한 최고급 옷감 주머니"],
      실크셋: ["튼튼한 저가형 실크 주머니", "튼튼한 일반 실크 주머니", "튼튼한 고급 실크 주머니", "튼튼한 최고급 실크 주머니", "튼튼한 꽃바구니"]
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
        const setContainerClose = document.createElement("div");
        setContainerClose.className = "set-container";

        const setContainerOpen = document.createElement("div");
        setContainerOpen.className = "set-container";
        
        setText.style.display = "inline";
        setText.style.margin = "0px 0px 10px";
        setText.innerText = "하단의 이미지를 드래그 하여 주머니 수배지의 + 칸에 옮기세요";

        //const setTitle = document.createElement("h2");
        //setTitle.innerHTML = `${setName}`;
        //container.appendChild(setTitle);
        
        container.appendChild(setContainerClose);
        container.appendChild(setContainerOpen);

        const colorC = (setName === "작물셋" || setName === "방직셋") ? colorC_crop_textile : colorC_other;

        for (const itemName of items) {
          try {
            const closeImageUrl = await createJumoneyImage(itemName, [colorA, colorB, colorC], "close");
            const closeItemContainer = createImageContainer(itemName, closeImageUrl, "close");
            setContainerClose.appendChild(closeItemContainer);

            const openImageUrl = await createJumoneyImage(itemName, [colorA, colorB, colorC], "open");
            const openItemContainer = createImageContainer(itemName, openImageUrl, "open");
            setContainerOpen.appendChild(openItemContainer);
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
	              //img.style.transform = "scale(2)";
		          if (imgAlt === "튼튼한 양털 주머니 open") {
					img.style.width = "100%";
		          } else {
		            img.style.width = "calc(100% - 2px)";
		          }
		        } else if (box.classList.contains('large-box')) {
		          //img.style.width = "calc(100% - 4px)";
		          //img.style.transform = "scale(4)";
		          if (imgAlt === "튼튼한 양털 주머니 open") {
					img.style.width = "calc(100% - 2px)";
		          } else {
		            img.style.width = "calc(100% - 6px)";
		          }
		        }
	
		        img.style.height = "auto"; // 높이는 자동 조절
		        box.innerHTML = ''; // 이전 내용을 지우고 새로운 이미지를 추가
		        box.appendChild(img);
		      });
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
	  })
	  .catch((error) => {
	    console.error('SVG 이미지 생성 오류:', error);
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