function a20a(){const y=['getBoundingClientRect','img','left','height','복사\x20실패:','이미지\x20로드\x20실패:','onerror','1103680zdYziD','getContext','904305saqAnT','svSWS','image/png','canvas','YsCdL','uQxwG','QMvsE','203469djexRb','XVLxM','이미지가\x20클립보드에\x20복사되었습니다!','error','createElement','map','getElementsByTagName','85NVgJVs','from','62704pWnDFe','width','clipboard','이미지를\x20Data\x20URL로\x20변환할\x20수\x20없습니다:','toDataURL','2805759QuXUvx','all','16UYwlYI','88494GEBxyV','top','onload','AbXjc','Hxpha','tpVbp','19554CaBTic','drawImage','jqcgZ','xDXbP','VlpUd','JXRUK','src'];a20a=function(){return y;};return a20a();}function a20b(a,b){const c=a20a();return a20b=function(d,e){d=d-0x11a;let f=c[d];return f;},a20b(a,b);}(function(a,b){const p=a20b,c=a();while(!![]){try{const d=parseInt(p(0x122))/0x1*(parseInt(p(0x11b))/0x2)+parseInt(p(0x132))/0x3+-parseInt(p(0x130))/0x4+-parseInt(p(0x140))/0x5*(-parseInt(p(0x11c))/0x6)+parseInt(p(0x139))/0x7+parseInt(p(0x142))/0x8+-parseInt(p(0x147))/0x9;if(d===b)break;else c['push'](c['shift']());}catch(e){c['push'](c['shift']());}}}(a20a,0x2688a));function convertImageToDataURL(a){const q=a20b,b={'uQxwG':'canvas','XVLxM':q(0x134),'JXRUK':q(0x145)},c=document['createElement'](b[q(0x137)]),d=c[q(0x131)]('2d');c[q(0x143)]=a['width'],c['height']=a[q(0x12c)],d[q(0x123)](a,0x0,0x0);try{return c[q(0x146)](b[q(0x13a)]);}catch(e){return console['error'](b[q(0x127)],e),null;}}async function copyToClipboard(a){const r=a20b,b={'Hxpha':function(h,i){return h-i;},'tpVbp':function(h){return h();},'svSWS':'CORS\x20문제로\x20이미지를\x20가져올\x20수\x20없습니다.','AbXjc':function(h,i){return h(i);},'QMvsE':r(0x13b),'jqcgZ':r(0x135),'VlpUd':'image/png'},c=document[r(0x13d)](b[r(0x124)]),d=a['getBoundingClientRect']();c[r(0x143)]=d[r(0x143)],c[r(0x12c)]=d['height'];const e=c['getContext']('2d'),f=Array[r(0x141)](a[r(0x13f)](r(0x12a))),g=f[r(0x13e)](h=>{const i={'AvdvP':function(j,k){return b['AbXjc'](j,k);}};return new Promise((j,k)=>{const u=a20b,l={'xDXbP':function(n,o){const s=a20b;return b[s(0x120)](n,o);},'YsCdL':function(n){const t=a20b;return b[t(0x121)](n);}},m=convertImageToDataURL(h);if(m){const n=new Image();n[u(0x128)]=m,n[u(0x11e)]=()=>{const v=u,o=h[v(0x129)]();e[v(0x123)](n,l['xDXbP'](o[v(0x12b)],d[v(0x12b)]),l[v(0x125)](o[v(0x11d)],d[v(0x11d)]),o['width'],o[v(0x12c)]),l[v(0x136)](j);},n[u(0x12f)]=o=>{const w=u;console[w(0x13c)](w(0x12e),o),i['AvdvP'](k,o);};}else k(b[u(0x133)]);});});try{await Promise[r(0x11a)](g),c['toBlob'](async h=>{const x=r,i=new ClipboardItem({'image/png':h});await navigator[x(0x144)]['write']([i]),b[x(0x11f)](alert,b[x(0x138)]);},b[r(0x126)]);}catch(h){console[r(0x13c)](r(0x12d),h),alert('클립보드\x20복사에\x20실패했습니다.');}}