(() => {
  'use strict';
  const pages = Array.from(document.querySelectorAll('body > section.page'));
  const $ = (sel, ctx=document) => ctx.querySelector(sel);
  const h = (tag, opts={}, children=[]) => {
    const el=document.createElement(tag);
    for (const [key,value] of Object.entries(opts)) {
      if(key==='class')el.className=value;
      else if(key==='text')el.textContent=value;
      else if(key==='html')el.innerHTML=value;
      else if(key==='dataset') Object.assign(el.dataset,value);
      else el.setAttribute(key,value);
    }
    for(const child of children)el.append(child);
    return el;
  };
  const normalize = str => String(str||'').normalize('NFKC').replace(/[\u064b-\u065f\u0670]/g,'').replace(/[أإآ]/g,'ا').replace(/ى/g,'ي').toLowerCase().trim();
  const sourceURL='https://github.com/alwansan/AI-';
  const urlFor = name => './pdf/'+name+'.pdf';
  const versions=[
    {weight:400,slug:'ArabicUIDisplay',title:'Arabic UI Display',description:'مظهر أخف للنصوص الطويلة والقراءة اليومية.',label:'عادي'},
    {weight:700,slug:'ArabicUIDisplayBold',title:'Arabic UI Display Bold',description:'مظهر متوسط السماكة، يوازن بين الوضوح والراحة.',label:'عريض'},
    {weight:900,slug:'ArabicUIDisplayBlack',title:'Arabic UI Display Black',description:'مظهر ثقيل ومميز، يبرز النصوص والعناوين.',label:'ثقيل'}
  ];
  for (let i=0;i<pages.length;i++) pages[i].id='page-'+(i+1);
  const pageTitles=pages.map((page,i)=>i===0?'الغلاف':(page.querySelector('h2')?.textContent||'القسم '+(i+1)));
  document.body.classList.add('reader-font-regular');
  const progress=h('div',{id:'reading-progress','aria-hidden':'true'});
  const toolbar=h('header',{id:'site-toolbar'},[
    h('a',{class:'site-brand',href:'#site-intro','aria-label':'العودة إلى البداية'},[
      h('span',{class:'site-mark',text:'AI'}),h('span',{class:'brand-label'},[
        h('strong',{text:'وكلاء الذكاء الاصطناعي'}),h('small',{text:'دليل إدارة المشاريع الرقمية • 2026'})
      ])
    ]),
    h('nav',{class:'toolbar-actions','aria-label':'أدوات التقرير'},[
      h('button',{class:'site-btn',id:'toc-toggle',type:'button',text:'☷ الفهرس'}),
      h('button',{class:'site-btn',id:'search-toggle',type:'button',text:'⌕ بحث'}),
      h('button',{class:'site-btn hide-mobile',id:'print-action',type:'button',text:'⎙ طباعة'}),
      h('a',{class:'site-btn primary hide-mobile',href:sourceURL,target:'_blank',rel:'noopener noreferrer',text:'GitHub'})
    ])
  ]);
  const hero=h('section',{id:'site-intro','aria-label':'مقدمة التقرير'},[
    h('div',{class:'hero-shell'},[
      h('div',{class:'hero-copy'},[
        h('p',{class:'hero-eyebrow',text:'دليل تطبيقي عربي | إصدار 2026'}),
        h('h1',{text:'وكلاء الذكاء الاصطناعي وإدارة المشاريع الرقمية'}),
        h('p',{text:'تعرّف على مفهوم الوكلاء، وطريقة إنشائهم، ودورهم في تنظيم المهام والاختبارات والتوثيق. تقرير مختصر يجمع الاستخدامات العملية ومؤشرات الإنتاجية ومخاطر الأمان دون مبالغة.'}),
        h('div',{class:'hero-tags'},[
          ...['15 صفحة مرجعية','10 رسوم توضيحية','مثال Python','خطة 30 يوماً'].map(t=>h('span',{class:'hero-tag',text:t}))
        ]),
        h('div',{class:'hero-cta'},[
          h('a',{class:'site-btn primary',href:'#page-2',text:'ابدأ القراءة'}),
          h('a',{class:'site-btn',href:'#version-panel',text:'مقارنة الخطوط'})
        ])
      ]),
      h('div',{class:'hero-art'},[
        h('img',{src:'صور_التقرير_المعاد_إنشاؤها_2026/01_cover.png',alt:'غلاف تقرير وكلاء الذكاء الاصطناعي وإدارة المشاريع الرقمية',loading:'eager',width:'260',height:'368'})
      ])
    ])
  ]);
  const cards=h('div',{class:'version-cards'});
  versions.forEach((v,i)=>{
    const btn=h('button',{type:'button',class:'site-btn weight-action',text:'استخدم للقراءة', 'aria-label':'تغيير مظهر القراءة إلى '+v.title});
    btn.addEventListener('click',()=>applyFont(v.weight));
    const pdfLink=h('a',{class:'site-btn pdf-link',href:urlFor(v.slug),download:v.slug+'.pdf',text:'تحميل PDF',hidden:''});
    pdfLink.hidden=true;
    const status=h('span',{class:'pdf-availability',text:'ملف PDF غير مرفوع إلى الموقع بعد'});
    const card=h('article',{class:'version-card',dataset:{weight:String(v.weight)}},[
      h('div',{class:'version-icon',text:['Aa','A+','A▰'][i]}),
      h('h3',{text:v.title}),h('p',{text:v.description}),
      h('div',{class:'version-sample',text:'العلم يفتح آفاقاً جديدة'}),
      h('div',{class:'version-actions'},[btn,pdfLink]),status
    ]);
    cards.append(card);
    // GitHub Pages only exposes PDFs once the binary files exist in /pdf.
    // A failed probe never creates a broken public download link.
    fetch(urlFor(v.slug),{method:'HEAD',cache:'no-store'}).then(resp=>{
      if(resp.ok && /pdf|octet-stream/i.test(resp.headers.get('content-type')||'application/pdf')){
        pdfLink.hidden=false;status.textContent='نسخة PDF متاحة للتحميل';status.classList.add('available');
      }
    }).catch(()=>{});
  });
  const versionPanel=h('section',{id:'version-panel','aria-label':'مقارنة خيارات الخطوط'},[
    h('div',{class:'panel-head'},[
      h('h2',{text:'اختر أسلوب القراءة'}),
      h('p',{text:'خيارات الويب تعرض أوزان خط مختلفة؛ ملفات PDF متاحة عند رفعها للموقع.'})
    ]),cards
  ]);
  const readerHead=h('div',{id:'reader-top'},[
    h('span',{class:'reader-note',text:'تصفّح التقرير بترتيب أقسامه، أو افتح الفهرس للانتقال مباشرة.'}),
    h('div',{class:'reader-controls'},[
      h('button',{class:'site-btn',id:'go-toc',type:'button',text:'فهرس الأقسام'}),
      h('button',{class:'site-btn',id:'reader-print',type:'button',text:'حفظ بصيغة PDF'})
    ])
  ]);
  const tocLinks=h('nav',{id:'toc-links','aria-label':'أقسام التقرير'});
  pageTitles.forEach((title,i)=>{
    const a=h('a',{class:'toc-link',href:'#page-'+(i+1)},[
      h('span',{class:'toc-number',text:String(i+1).padStart(2,'0')}),h('span',{text:title})
    ]);
    tocLinks.append(a);
  });
  const tocOverlay=h('div',{class:'overlay',id:'toc-overlay',hidden:'',role:'dialog','aria-modal':'true','aria-label':'فهرس التقرير'},[
    h('aside',{id:'toc-drawer'},[
      h('div',{class:'drawer-top'},[h('h2',{text:'فهرس التقرير'}),h('button',{class:'close-btn',type:'button',text:'×','aria-label':'إغلاق الفهرس',id:'toc-close'})]),
      h('p',{class:'reader-note',text:'اختر القسم المطلوب للتنقل داخل التقرير.'}),tocLinks
    ])
  ]);
  tocOverlay.hidden=true;
  const image=h('img',{alt:'عرض مكبر للصورة'});
  const imageCaption=h('figcaption',{text:''});
  const imageOverlay=h('div',{class:'overlay',id:'image-overlay',hidden:'',role:'dialog','aria-modal':'true','aria-label':'عرض الصورة بحجم أكبر'},[
    h('figure',{id:'image-view'},[
      h('button',{class:'close-btn',id:'image-close',type:'button',text:'×','aria-label':'إغلاق الصورة'}),image,imageCaption
    ])
  ]);
  imageOverlay.hidden=true;
  const searchResults=h('div',{id:'search-results'});
  const searchInput=h('input',{class:'search-input',id:'report-search',type:'search',placeholder:'ابحث عن وكيل، مشروع، إنتاجية، أمان…','aria-label':'البحث داخل التقرير',autocomplete:'off'});
  const searchOverlay=h('div',{class:'overlay',id:'search-overlay',hidden:'',role:'dialog','aria-modal':'true','aria-label':'البحث في التقرير'},[
    h('div',{id:'search-panel'},[
      h('div',{class:'drawer-top'},[h('h2',{text:'ابحث داخل التقرير'}),h('button',{class:'close-btn',id:'search-close',type:'button',text:'×','aria-label':'إغلاق البحث'})]),
      h('div',{class:'search-row'},[searchInput]),searchResults
    ])
  ]);
  searchOverlay.hidden=true;
  const bottom=h('footer',{id:'site-bottom'},[
    h('p',{text:'إصدار تعليمي مختصر لعام 2026 • الرسومات توضيحية، وأمثلة الأرقام افتراضية حيث ورد التنبيه.'}),
    h('a',{href:sourceURL,target:'_blank',rel:'noopener noreferrer',text:'عرض مستودع المشروع على GitHub'})
  ]);
  document.body.prepend(progress,toolbar,hero,versionPanel,readerHead);
  document.body.append(bottom,tocOverlay,imageOverlay,searchOverlay);
  document.querySelectorAll('section.page table').forEach(table=>{
    const wrapper=h('div',{class:'table-scroll',role:'region',tabindex:'0','aria-label':'جدول قابل للتمرير'});
    table.parentNode.insertBefore(wrapper,table);wrapper.append(table);
  });
  function applyFont(w){
    document.body.classList.remove('reader-font-regular','reader-font-bold','reader-font-black');
    document.body.classList.add(w===400?'reader-font-regular':w===700?'reader-font-bold':'reader-font-black');
    cards.querySelectorAll('.version-card').forEach(el=>{
      const active=el.dataset.weight===String(w);el.classList.toggle('current',active);
      const b=el.querySelector('.weight-action');b.textContent=active?'✓ النمط الحالي':'استخدم للقراءة';b.setAttribute('aria-pressed',String(active));
    });
    try{localStorage.setItem('ai-report-reader-weight',String(w));}catch(_){ }
  }
  let saved='400';try{saved=localStorage.getItem('ai-report-reader-weight')||'400';}catch(_){ }
  applyFont([400,700,900].includes(Number(saved))?Number(saved):400);
  const toggleDialog=(el,open)=>{el.hidden=!open;document.body.style.overflow=open?'hidden':''};
  const showTOC=()=>toggleDialog(tocOverlay,true);
  $('#toc-toggle').addEventListener('click',showTOC);$('#go-toc').addEventListener('click',showTOC);
  $('#toc-close').addEventListener('click',()=>toggleDialog(tocOverlay,false));
  tocOverlay.addEventListener('click',e=>{if(e.target===tocOverlay || e.target.closest('a.toc-link'))toggleDialog(tocOverlay,false)});
  document.querySelectorAll('section.page .artbox img').forEach(el=>{
    el.setAttribute('tabindex','0');el.setAttribute('role','button');el.setAttribute('aria-label','تكبير الرسم: '+(el.alt||'رسم توضيحي'));
    const show=()=>{image.src=el.currentSrc||el.src;image.alt=el.alt||'رسم توضيحي';imageCaption.textContent=el.closest('figure')?.querySelector('figcaption')?.textContent||el.alt;toggleDialog(imageOverlay,true)};
    el.addEventListener('click',show);
    el.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();show()}});
  });
  $('#image-close').addEventListener('click',()=>toggleDialog(imageOverlay,false));
  imageOverlay.addEventListener('click',e=>{if(e.target===imageOverlay)toggleDialog(imageOverlay,false)});
  const showSearch=()=>{toggleDialog(searchOverlay,true);searchInput.focus()};
  $('#search-toggle').addEventListener('click',showSearch);
  $('#search-close').addEventListener('click',()=>toggleDialog(searchOverlay,false));
  searchOverlay.addEventListener('click',e=>{if(e.target===searchOverlay||e.target.closest('a.search-result'))toggleDialog(searchOverlay,false)});
  function searchReport(query){
    searchResults.replaceChildren();const q=normalize(query);
    if(q.length<2){searchResults.append(h('p',{class:'reader-note',text:'اكتب كلمتين أو أكثر للبحث عن مواضعها في التقرير.'}));return}
    let n=0;
    pages.slice(1).forEach((page,j)=>{
      const text=page.textContent||'';
      if(!normalize(text).includes(q))return;
      const parts=Array.from(page.querySelectorAll('h2,h3,p,li,td')).filter(p=>normalize(p.textContent).includes(q));
      for(const part of parts.slice(0,3)){
        if(n++>=15)break;
        const snippet=(part.textContent||'').replace(/\s+/g,' ').trim().slice(0,180);
        const link=h('a',{class:'search-result',href:'#page-'+(j+2)},[
          h('strong',{text:pageTitles[j+1]}),h('small',{text:'القسم '+(j+2)+' • '+snippet})
        ]);
        searchResults.append(link);
      }
    });
    if(!n)searchResults.append(h('p',{class:'reader-note',text:'لم أجد نتائج. جرّب كلمة أبسط أو مرادفاً آخر.'}));
  }
  searchInput.addEventListener('input',()=>searchReport(searchInput.value));searchReport('');
  document.addEventListener('keydown',e=>{if(e.key==='Escape')for(const el of [tocOverlay,imageOverlay,searchOverlay])el.hidden||toggleDialog(el,false);
    if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='k'){e.preventDefault();showSearch()}});
  $('#print-action').addEventListener('click',()=>window.print());$('#reader-print').addEventListener('click',()=>window.print());
  let framePending=false;
  const updateProgress=()=>{if(framePending)return;framePending=true;requestAnimationFrame(()=>{
    const scrollMax=document.documentElement.scrollHeight-innerHeight;
    progress.style.width=(scrollMax>0?(scrollY/scrollMax*100):0).toFixed(2)+'%';framePending=false;
  })};
  window.addEventListener('scroll',updateProgress,{passive:true});window.addEventListener('resize',updateProgress,{passive:true});updateProgress();
})();