import{P as O,u as v,a as j,E as B}from"./vendor-export-C98UG4Mq.js";import"./vendor-react-BdB5Pz3t.js";const W={A4:{width:210,height:297},A3:{width:297,height:420},Letter:{width:216,height:279}},U={normal:{top:25,right:25,bottom:25,left:25},narrow:{top:15,right:15,bottom:15,left:15},wide:{top:35,right:35,bottom:35,left:35}};async function X(e,t,r,a){try{switch(r){case"pdf":return await H(e,t,a);case"docx":return await ee(e,t,a);case"xlsx":return te(e,t,a);case"html":return se(e,t,a);case"markdown":return pe(e,t,a);case"pptx":return await ie(e,t,a);default:return{success:!1,error:`Format non supporté: ${r}`}}}catch(i){return{success:!1,error:i instanceof Error?i.message:"Erreur inconnue lors de l'export"}}}function N(e){var a,i,n,o;const t=e.designSettings,r=c=>{const d=/^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(c);return d?[parseInt(d[1],16),parseInt(d[2],16),parseInt(d[3],16)]:[28,49,99]};return{primaryColor:(a=t==null?void 0:t.colors)!=null&&a.primary?r(t.colors.primary):[28,49,99],textColor:(i=t==null?void 0:t.colors)!=null&&i.text?r(t.colors.text):[51,51,51],backgroundColor:(n=t==null?void 0:t.colors)!=null&&n.background?r(t.colors.background):[255,255,255],baseFontSize:((o=t==null?void 0:t.typography)==null?void 0:o.baseFontSize)||11}}async function H(e,t,r){var S,M,D,T,F,C,b;const a=e.designSettings,i=W[((S=a==null?void 0:a.pageFormat)==null?void 0:S.size)||r.pageSize||"A4"],n=U[((M=a==null?void 0:a.pageFormat)==null?void 0:M.margins)||r.margins||"normal"],c=(((D=a==null?void 0:a.pageFormat)==null?void 0:D.orientation)||r.orientation||"portrait")==="landscape",d=N(e),l=new B({orientation:c?"landscape":"portrait",unit:"mm",format:(((T=a==null?void 0:a.pageFormat)==null?void 0:T.size)||r.pageSize||"A4").toLowerCase()}),s=c?i.height:i.width,p=c?i.width:i.height,h=s-n.left-n.right;let u=n.top;(((F=a==null?void 0:a.cover)==null?void 0:F.enabled)??r.includeCoverPage)&&(u=K(l,e,s,p,n,d),l.addPage(),u=n.top),(((C=a==null?void 0:a.tableOfContents)==null?void 0:C.enabled)??r.includeTableOfContents)&&(u=V(l,t,s,n,u,d),l.addPage(),u=n.top);for(const E of t.sections)u=await R(l,E,h,p,n,u,d);k(l,n,s,p,(b=a==null?void 0:a.branding)==null?void 0:b.footerText);const y=l.output("blob"),z=`${w(e.title)}.pdf`;return{success:!0,blob:y,filename:z}}function K(e,t,r,a,i,n){var s,p;const o=t.designSettings,c=((s=o==null?void 0:o.cover)==null?void 0:s.title)||t.title,d=((p=o==null?void 0:o.cover)==null?void 0:p.subtitle)||t.description;e.setFillColor(n.primaryColor[0],n.primaryColor[1],n.primaryColor[2]),e.rect(0,0,r,a/3,"F"),e.setTextColor(255,255,255),e.setFontSize(32),e.setFont("helvetica","bold"),e.text(c,r/2,a/6,{align:"center"}),d&&(e.setFontSize(14),e.setFont("helvetica","normal"),e.text(d,r/2,a/6+20,{align:"center",maxWidth:r-60})),e.setTextColor(n.textColor[0],n.textColor[1],n.textColor[2]),e.setFontSize(12),t.periodLabel&&e.text(`Période: ${t.periodLabel}`,i.left,a/2),e.text(`Auteur: ${t.author}`,i.left,a/2+10);const l=new Date().toLocaleDateString("fr-FR",{year:"numeric",month:"long",day:"numeric"});return e.text(`Généré le: ${l}`,i.left,a/2+20),i.top}function V(e,t,r,a,i,n){return e.setTextColor(n.primaryColor[0],n.primaryColor[1],n.primaryColor[2]),e.setFontSize(20),e.setFont("helvetica","bold"),e.text("Table des matières",a.left,i),i+=15,e.setTextColor(n.textColor[0],n.textColor[1],n.textColor[2]),e.setFontSize(12),e.setFont("helvetica","normal"),t.sections.forEach((o,c)=>{const d=(o.level-1)*5;e.text(`${c+1}. ${o.title}`,a.left+d,i),i+=8}),i}async function R(e,t,r,a,i,n,o){n>a-i.bottom-30&&(e.addPage(),n=i.top),e.setTextColor(o.primaryColor[0],o.primaryColor[1],o.primaryColor[2]);const c=Math.max(20-(t.level-1)*4,12);e.setFontSize(c),e.setFont("helvetica","bold"),e.text(t.title,i.left,n),n+=c/2+5,e.setTextColor(o.textColor[0],o.textColor[1],o.textColor[2]),e.setFont("helvetica","normal");for(const d of t.blocks)n=Y(e,d,r,a,i,n,o);for(const d of t.children)n=await R(e,d,r,a,i,n,o);return n+10}function Y(e,t,r,a,i,n,o){var c;switch(n>a-i.bottom-20&&(e.addPage(),n=i.top),t.type){case"paragraph":e.setFontSize(o.baseFontSize),e.setFont("helvetica","normal");const d=e.splitTextToSize(t.content,r);e.text(d,i.left,n),n+=d.length*5+5;break;case"heading":const l=Math.max(18-(t.level-1)*2,12);e.setFontSize(l),e.setFont("helvetica","bold"),e.text(t.content,i.left,n),n+=l/2+8;break;case"list":n=J(e,t,i,n);break;case"table":n=Z(e,t,r,i,n,a);break;case"kpi_card":n=Q(e,t,i,n);break;case"callout":n=P(e,t,r,i,n);break;case"divider":e.setDrawColor(200,200,200),e.line(i.left,n,i.left+r,n),n+=10;break;case"pagebreak":e.addPage(),n=i.top;break;case"quote":e.setFontSize(11),e.setFont("helvetica","italic"),e.setTextColor(100,100,100);const s=e.splitTextToSize(`"${t.content}"`,r-20);e.text(s,i.left+10,n),n+=s.length*5,t.author&&(e.setFont("helvetica","normal"),e.text(`— ${t.author}`,i.left+10,n+5),n+=10),e.setTextColor(0,0,0),n+=5;break;case"chart":e.setFontSize(10),e.setTextColor(100,100,100);const p=((c=t.config)==null?void 0:c.title)||"Graphique";e.text(`[Graphique: ${p}]`,i.left,n),e.setTextColor(0,0,0),n+=40;break;case"image":e.setFontSize(10),e.setTextColor(100,100,100),e.text(`[Image: ${t.alt||t.caption||"Image"}]`,i.left,n),e.setTextColor(0,0,0),n+=20;break}return n}function J(e,t,r,a){return e.setFontSize(11),e.setFont("helvetica","normal"),t.items.forEach((i,n)=>{const o=t.listType==="numbered"?`${n+1}.`:"•";e.text(`${o} ${i.content}`,r.left+5,a),a+=6}),a+5}function Z(e,t,r,a,i,n){const c=r/t.headers.length,d=8;return e.setFillColor(28,49,99),e.rect(a.left,i-5,r,d,"F"),e.setTextColor(255,255,255),e.setFontSize(9),e.setFont("helvetica","bold"),t.headers.forEach((l,s)=>{e.text(l.label,a.left+s*c+3,i)}),i+=d,e.setTextColor(0,0,0),e.setFont("helvetica","normal"),t.rows.forEach((l,s)=>{i>n-a.bottom-20&&(e.addPage(),i=a.top),s%2===1&&(e.setFillColor(245,245,245),e.rect(a.left,i-5,r,d,"F")),t.headers.forEach((p,h)=>{const u=l[p.key],x=(u==null?void 0:u.formatted)||String((u==null?void 0:u.value)||"");e.text(x.substring(0,20),a.left+h*c+3,i)}),i+=d}),i+5}function Q(e,t,r,a){if(e.setFontSize(10),e.setTextColor(100,100,100),e.text(t.label,r.left,a),a+=6,e.setFontSize(18),e.setTextColor(28,49,99),e.setFont("helvetica","bold"),e.text(`${t.value}${t.unit||""}`,r.left,a),t.change!==void 0){const i=t.changeType==="positive"?[34,197,94]:t.changeType==="negative"?[239,68,68]:[100,100,100];e.setTextColor(i[0],i[1],i[2]),e.setFontSize(10);const n=t.change>=0?"+":"";e.text(`${n}${t.change}%`,r.left+50,a)}return e.setTextColor(0,0,0),e.setFont("helvetica","normal"),a+15}function P(e,t,r,a,i){const n={info:[59,130,246],warning:[245,158,11],success:[34,197,94],error:[239,68,68],tip:[168,85,247]},o=n[t.variant]||n.info;e.setFillColor(o[0],o[1],o[2],.1),e.setDrawColor(o[0],o[1],o[2]),e.roundedRect(a.left,i-5,r,25,2,2,"FD"),t.title&&(e.setFontSize(11),e.setFont("helvetica","bold"),e.setTextColor(o[0],o[1],o[2]),e.text(t.title,a.left+5,i+2),i+=8),e.setFontSize(10),e.setFont("helvetica","normal"),e.setTextColor(0,0,0);const c=e.splitTextToSize(t.content,r-10);return e.text(c,a.left+5,i+2),i+25}function k(e,t,r,a,i){const n=e.getNumberOfPages();for(let o=1;o<=n;o++)e.setPage(o),e.setFontSize(9),e.setTextColor(150,150,150),e.text(`Page ${o} / ${n}`,r/2,a-t.bottom/2,{align:"center"}),i&&e.text(i,r/2,a-t.bottom/2+5,{align:"center"})}async function ee(e,t,r){const a=q(e,t,r,!0),i=`
<!DOCTYPE html>
<html xmlns:o="urn:schemas-microsoft-com:office:office"
      xmlns:w="urn:schemas-microsoft-com:office:word"
      xmlns="http://www.w3.org/TR/REC-html40">
<head>
  <meta charset="utf-8">
  <title>${e.title}</title>
  <style>
    @page { size: ${r.pageSize||"A4"} ${r.orientation||"portrait"}; margin: 2.5cm; }
    body { font-family: Calibri, Arial, sans-serif; font-size: 11pt; line-height: 1.5; }
    h1 { font-size: 24pt; color: #1C3163; margin-top: 24pt; }
    h2 { font-size: 18pt; color: #1C3163; margin-top: 18pt; }
    h3 { font-size: 14pt; color: #1C3163; margin-top: 14pt; }
    table { border-collapse: collapse; width: 100%; margin: 12pt 0; }
    th { background-color: #1C3163; color: white; padding: 8pt; text-align: left; }
    td { border: 1px solid #ddd; padding: 8pt; }
    tr:nth-child(even) { background-color: #f9f9f9; }
    .callout { padding: 12pt; margin: 12pt 0; border-left: 4px solid #1C3163; background: #f5f5f5; }
    .kpi { display: inline-block; padding: 12pt; margin: 6pt; background: #f5f5f5; border-radius: 8pt; }
    blockquote { font-style: italic; color: #666; border-left: 3px solid #ddd; padding-left: 12pt; margin: 12pt 0; }
  </style>
</head>
<body>
${a}
</body>
</html>`,n=new Blob([i],{type:"application/vnd.openxmlformats-officedocument.wordprocessingml.document"}),o=`${w(e.title)}.doc`;return{success:!0,blob:n,filename:o}}function te(e,t,r){const a=v.book_new(),i=[["Rapport",e.title],["Description",e.description||""],["Auteur",e.author],["Période",e.periodLabel||""],["Statut",e.status],["Version",e.version],["Créé le",new Date(e.createdAt).toLocaleDateString("fr-FR")],["Modifié le",new Date(e.updatedAt).toLocaleDateString("fr-FR")]],n=v.aoa_to_sheet(i);v.book_append_sheet(a,n,"Résumé");let o=0;t.sections.forEach(p=>{p.blocks.forEach(h=>{if(h.type==="table"){o++;const u=ae(h),x=`Tableau ${o}`.substring(0,31);v.book_append_sheet(a,u,x)}if(h.type==="chart"&&h.data){o++;const u=re(h),x=`Données ${o}`.substring(0,31);v.book_append_sheet(a,u,x)}h.type})});const c=ne(t);if(c.length>1){const p=v.aoa_to_sheet(c);v.book_append_sheet(a,p,"Indicateurs")}const d=j(a,{bookType:"xlsx",type:"array"}),l=new Blob([d],{type:"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"}),s=`${w(e.title)}.xlsx`;return{success:!0,blob:l,filename:s}}function ae(e){const t=e.headers.map(a=>a.label),r=e.rows.map(a=>e.headers.map(i=>{const n=a[i.key];return(n==null?void 0:n.formatted)||(n==null?void 0:n.value)||""}));return v.aoa_to_sheet([t,...r])}function re(e){const t=[],r=["Label",...e.data.datasets.map(a=>a.label)];return t.push(r),e.data.labels&&e.data.labels.forEach((a,i)=>{const n=[a];e.data.datasets.forEach(o=>{n.push(o.data[i])}),t.push(n)}),v.aoa_to_sheet(t)}function ne(e){const t=[["Indicateur","Valeur","Unité","Variation","Tendance"]];return e.sections.forEach(r=>{r.blocks.forEach(a=>{a.type==="kpi_card"&&t.push([a.label,a.value,a.unit||"",a.change||0,a.changeType||"neutral"])})}),t}async function ie(e,t,r){const a=new O;a.author=e.author,a.title=e.title,a.subject=e.description||"",a.company="EasyView-BI";const i="1C3163",n="333333",o="F5F5F5";if(r.includeCoverPage){const l=a.addSlide();l.addShape("rect",{x:0,y:0,w:"100%",h:"40%",fill:{color:i}}),l.addText(e.title,{x:.5,y:1.5,w:"90%",h:1,fontSize:36,bold:!0,color:"FFFFFF",align:"center"}),e.description&&l.addText(e.description,{x:.5,y:2.5,w:"90%",h:.5,fontSize:16,color:"FFFFFF",align:"center"});const s=[e.periodLabel?`Période: ${e.periodLabel}`:"",`Auteur: ${e.author}`,`Date: ${new Date().toLocaleDateString("fr-FR")}`].filter(Boolean).join(`
`);l.addText(s,{x:.5,y:4,w:"90%",h:1,fontSize:14,color:n,align:"center"})}if(r.includeTableOfContents&&t.sections.length>0){const l=a.addSlide();l.addText("Table des matières",{x:.5,y:.3,w:"90%",h:.6,fontSize:28,bold:!0,color:i});const s=t.sections.map((p,h)=>({text:`${h+1}. ${p.title}`,options:{bullet:!1,fontSize:16,color:n}}));l.addText(s,{x:.5,y:1.2,w:"90%",h:4,valign:"top"})}for(const l of t.sections)await I(a,l,i,n,o);const c=await a.write({outputType:"blob"}),d=`${w(e.title)}.pptx`;return{success:!0,blob:c,filename:d}}async function I(e,t,r,a,i){const n=e.addSlide();n.addShape("rect",{x:0,y:2,w:"100%",h:1.5,fill:{color:r}}),n.addText(t.title,{x:.5,y:2.2,w:"90%",h:1,fontSize:32,bold:!0,color:"FFFFFF",align:"center"});let o=null,c=1;const d=5;for(const l of t.blocks){if(!o||c>=d||l.type==="pagebreak"){if(l.type==="pagebreak")continue;o=e.addSlide(),o.addText(t.title,{x:.3,y:.2,w:"95%",h:.5,fontSize:14,color:r,bold:!0}),c=1}c=oe(o,l,c,r,a,i)}for(const l of t.children)await I(e,l,r,a,i)}function oe(e,t,r,a,i,n){var d,l,s,p,h,u,x,L,y,z,S;switch(t.type){case"paragraph":return e.addText(t.content,{x:.5,y:r,w:9,h:.5,fontSize:14,color:i,valign:"top"}),r+.6;case"heading":const M={1:28,2:24,3:20,4:18,5:16,6:14};return e.addText(t.content,{x:.5,y:r,w:9,h:.6,fontSize:M[t.level]||18,bold:!0,color:a}),r+.8;case"list":const D=t.items.map((g,m)=>({text:t.listType==="numbered"?`${m+1}. ${g.content}`:g.content,options:{bullet:t.listType==="bullet",fontSize:14,color:i}}));return e.addText(D,{x:.5,y:r,w:9,h:t.items.length*.35,valign:"top"}),r+t.items.length*.35+.2;case"table":const T=[];T.push(t.headers.map(g=>({text:g.label,options:{fill:{color:a},color:"FFFFFF",bold:!0,fontSize:11,align:"center"}})));const F=t.rows.slice(0,8);return F.forEach((g,m)=>{T.push(t.headers.map(_=>{const $=g[_.key];return{text:String(($==null?void 0:$.formatted)||($==null?void 0:$.value)||""),options:{fill:{color:m%2===0?"FFFFFF":n},fontSize:10,align:"left"}}}))}),t.rows.length>8&&T.push(t.headers.map((g,m)=>({text:m===0?`... et ${t.rows.length-8} lignes supplémentaires`:"",options:{fontSize:9,italic:!0,color:"666666"}}))),e.addTable(T,{x:.5,y:r,w:9,colW:t.headers.map(()=>9/t.headers.length),border:{pt:.5,color:"CCCCCC"}}),r+Math.min(F.length+2,10)*.35+.3;case"chart":if((d=t.data)!=null&&d.labels&&((s=(l=t.data)==null?void 0:l.datasets)==null?void 0:s.length)>0){const g=le(t.chartType),m=t.data.datasets.map(_=>({name:_.label,labels:t.data.labels||[],values:_.data.map($=>$??0)}));try{e.addChart(g,m,{x:.5,y:r,w:9,h:2.5,showTitle:!!((p=t.config)!=null&&p.title),title:((h=t.config)==null?void 0:h.title)||"",titleFontSize:12,titleColor:a,showLegend:((x=(u=t.config)==null?void 0:u.legend)==null?void 0:x.show)??!0,legendPos:((y=(L=t.config)==null?void 0:L.legend)==null?void 0:y.position)==="bottom"?"b":"t"})}catch{return e.addText(`[Graphique: ${((z=t.config)==null?void 0:z.title)||"Données"}]`,{x:.5,y:r,w:9,h:1,fontSize:12,color:"666666",italic:!0,align:"center"}),r+1.2}}else return e.addText(`[Graphique: ${((S=t.config)==null?void 0:S.title)||"Graphique"}]`,{x:.5,y:r,w:9,h:1,fontSize:12,color:"666666",italic:!0,align:"center"}),r+1.2;return r+2.8;case"kpi_card":if(e.addShape("roundRect",{x:.5,y:r,w:3,h:1.2,fill:{color:n},line:{color:"DDDDDD",pt:1}}),e.addText(t.label,{x:.5+.15,y:r+.1,w:2.7,h:.3,fontSize:10,color:"666666"}),e.addText(`${t.value}${t.unit||""}`,{x:.5+.15,y:r+.4,w:2.7,h:.5,fontSize:24,bold:!0,color:a}),t.change!==void 0){const g=t.changeType==="positive"?"22C55E":t.changeType==="negative"?"EF4444":"666666",m=t.change>=0?"+":"";e.addText(`${m}${t.change}%`,{x:.5+.15,y:r+.85,w:2.7,h:.25,fontSize:11,color:g})}return r+1.4;case"callout":const C={info:"3B82F6",warning:"F59E0B",success:"22C55E",error:"EF4444",tip:"A855F7"},b=C[t.variant]||C.info;e.addShape("rect",{x:.5,y:r,w:9,h:.8,fill:{color:b,transparency:90},line:{color:b,pt:2}});const E=t.title?`${t.title}: ${t.content}`:t.content;return e.addText(E,{x:.5+.15,y:r+.15,w:9-.3,h:.5,fontSize:12,color:i}),r+1;case"quote":return e.addText(`"${t.content}"`,{x:.5+.3,y:r,w:9-.6,h:.6,fontSize:14,italic:!0,color:"666666"}),t.author?(e.addText(`— ${t.author}`,{x:.5+.3,y:r+.5,w:9-.6,h:.3,fontSize:11,color:"888888"}),r+.9):r+.7;case"divider":return e.addShape("line",{x:.5,y:r+.15,w:9,h:0,line:{color:"CCCCCC",pt:1,dashType:t.style==="dashed"?"dash":"solid"}}),r+.4;case"image":if(t.src&&t.src.startsWith("data:"))try{return e.addImage({data:t.src,x:.5,y:r,w:4,h:2.5}),t.caption&&e.addText(t.caption,{x:.5,y:r+2.5,w:4,h:.3,fontSize:10,italic:!0,color:"666666",align:"center"}),r+2.9}catch{}return e.addText(`[Image: ${t.alt||t.caption||"Image"}]`,{x:.5,y:r,w:9,h:.5,fontSize:12,color:"666666",italic:!0,align:"center"}),r+.6;default:return r}}function le(e){return{bar:"bar",horizontal_bar:"bar",stacked_bar:"bar",line:"line",area:"area",pie:"pie",donut:"doughnut"}[e]||"bar"}function se(e,t,r){const a=`
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${f(e.title)}</title>
  <style>
    :root {
      --primary: #1C3163;
      --primary-light: #2a4a8c;
      --text: #333;
      --text-light: #666;
      --border: #e5e5e5;
      --bg-light: #f9fafb;
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      color: var(--text);
      max-width: 900px;
      margin: 0 auto;
      padding: 40px 20px;
    }
    .cover { text-align: center; padding: 60px 0; margin-bottom: 40px; border-bottom: 2px solid var(--primary); }
    .cover h1 { font-size: 2.5rem; color: var(--primary); margin-bottom: 16px; }
    .cover p { color: var(--text-light); }
    .toc { margin: 40px 0; padding: 24px; background: var(--bg-light); border-radius: 8px; }
    .toc h2 { margin-bottom: 16px; color: var(--primary); }
    .toc ul { list-style: none; }
    .toc li { padding: 8px 0; border-bottom: 1px solid var(--border); }
    .toc a { color: var(--primary); text-decoration: none; }
    .toc a:hover { text-decoration: underline; }
    .section { margin: 40px 0; }
    h1, h2, h3, h4, h5, h6 { color: var(--primary); margin: 24px 0 16px; }
    h2 { font-size: 1.75rem; padding-bottom: 8px; border-bottom: 2px solid var(--primary); }
    h3 { font-size: 1.5rem; }
    h4 { font-size: 1.25rem; }
    p { margin: 12px 0; }
    table { width: 100%; border-collapse: collapse; margin: 20px 0; }
    th { background: var(--primary); color: white; padding: 12px; text-align: left; }
    td { border: 1px solid var(--border); padding: 12px; }
    tr:nth-child(even) { background: var(--bg-light); }
    .callout { padding: 16px 20px; margin: 20px 0; border-radius: 8px; border-left: 4px solid; }
    .callout.info { background: #eff6ff; border-color: #3b82f6; }
    .callout.warning { background: #fefce8; border-color: #f59e0b; }
    .callout.success { background: #f0fdf4; border-color: #22c55e; }
    .callout.error { background: #fef2f2; border-color: #ef4444; }
    .callout.tip { background: #faf5ff; border-color: #a855f7; }
    .callout-title { font-weight: 600; margin-bottom: 8px; }
    .kpi-card { display: inline-block; padding: 20px; margin: 10px; background: var(--bg-light); border-radius: 12px; min-width: 180px; }
    .kpi-label { font-size: 0.875rem; color: var(--text-light); }
    .kpi-value { font-size: 2rem; font-weight: 700; color: var(--primary); }
    .kpi-change { font-size: 0.875rem; }
    .kpi-change.positive { color: #22c55e; }
    .kpi-change.negative { color: #ef4444; }
    blockquote { font-style: italic; color: var(--text-light); border-left: 3px solid var(--border); padding-left: 16px; margin: 20px 0; }
    .divider { border: none; border-top: 1px solid var(--border); margin: 30px 0; }
    .chart-placeholder { background: var(--bg-light); padding: 40px; text-align: center; border-radius: 8px; color: var(--text-light); margin: 20px 0; }
    ul, ol { margin: 12px 0; padding-left: 24px; }
    li { margin: 6px 0; }
    @media print {
      body { max-width: 100%; padding: 0; }
      .pagebreak { page-break-after: always; }
    }
  </style>
</head>
<body>
${r.includeCoverPage?de(e):""}
${r.includeTableOfContents?ce(t):""}
${q(e,t,r,!1)}
</body>
</html>`,i=new Blob([a],{type:"text/html;charset=utf-8"}),n=`${w(e.title)}.html`;return{success:!0,blob:i,filename:n}}function de(e){return`
<div class="cover">
  <h1>${f(e.title)}</h1>
  ${e.description?`<p>${f(e.description)}</p>`:""}
  <p style="margin-top: 24px;">
    ${e.periodLabel?`<strong>Période:</strong> ${f(e.periodLabel)}<br>`:""}
    <strong>Auteur:</strong> ${f(e.author)}<br>
    <strong>Date:</strong> ${new Date().toLocaleDateString("fr-FR",{year:"numeric",month:"long",day:"numeric"})}
  </p>
</div>`}function ce(e){return`
<div class="toc">
  <h2>Table des matières</h2>
  <ul>${e.sections.map((r,a)=>`<li><a href="#section-${a}">${a+1}. ${f(r.title)}</a></li>`).join(`
`)}</ul>
</div>`}function q(e,t,r,a){return t.sections.map((i,n)=>A(i,n,a)).join(`
`)}function A(e,t,r){const a=`h${Math.min(e.level+1,6)}`,i=e.blocks.map(o=>ue(o,r)).join(`
`),n=e.children.map((o,c)=>A(o,c,r)).join(`
`);return`
<div class="section" id="section-${t}">
  <${a}>${f(e.title)}</${a}>
  ${i}
  ${n}
</div>`}function ue(e,t){var r;switch(e.type){case"paragraph":return`<p>${f(e.content)}</p>`;case"heading":const a=`h${Math.min(e.level+1,6)}`;return`<${a}>${f(e.content)}</${a}>`;case"list":const i=e.listType==="numbered"?"ol":"ul",n=e.items.map(s=>`<li>${f(s.content)}</li>`).join(`
`);return`<${i}>${n}</${i}>`;case"table":const o=e.headers.map(s=>`<th>${f(s.label)}</th>`).join(""),c=e.rows.map(s=>`<tr>${e.headers.map(h=>{const u=s[h.key];return`<td>${f(String((u==null?void 0:u.formatted)||(u==null?void 0:u.value)||""))}</td>`}).join("")}</tr>`).join(`
`);return`<table><thead><tr>${o}</tr></thead><tbody>${c}</tbody></table>`;case"callout":return`
<div class="callout ${e.variant}">
  ${e.title?`<div class="callout-title">${f(e.title)}</div>`:""}
  <div>${f(e.content)}</div>
</div>`;case"kpi_card":const d=e.changeType==="positive"?"positive":e.changeType==="negative"?"negative":"",l=e.change!==void 0&&e.change>=0?"+":"";return`
<div class="kpi-card">
  <div class="kpi-label">${f(e.label)}</div>
  <div class="kpi-value">${f(String(e.value))}${e.unit?f(e.unit):""}</div>
  ${e.change!==void 0?`<div class="kpi-change ${d}">${l}${e.change}%</div>`:""}
</div>`;case"quote":return`
<blockquote>
  "${f(e.content)}"
  ${e.author?`<footer>— ${f(e.author)}</footer>`:""}
</blockquote>`;case"divider":return'<hr class="divider">';case"pagebreak":return t?'<br clear="all" style="page-break-before: always;">':'<div class="pagebreak"></div>';case"chart":return`<div class="chart-placeholder">[Graphique: ${f(((r=e.config)==null?void 0:r.title)||"Graphique")}]</div>`;case"image":return e.src?`
<figure>
  <img src="${f(e.src)}" alt="${f(e.alt||"")}" style="max-width: 100%; height: auto;">
  ${e.caption?`<figcaption>${f(e.caption)}</figcaption>`:""}
</figure>`:`<div class="chart-placeholder">[Image: ${f(e.alt||e.caption||"Image")}]</div>`;default:return""}}function pe(e,t,r){let a="";r.includeCoverPage&&(a+=`# ${e.title}

`,e.description&&(a+=`> ${e.description}

`),a+=`**Auteur:** ${e.author}  
`,e.periodLabel&&(a+=`**Période:** ${e.periodLabel}  
`),a+=`**Date:** ${new Date().toLocaleDateString("fr-FR")}

`,a+=`---

`),r.includeTableOfContents&&(a+=`## Table des matières

`,t.sections.forEach((o,c)=>{const d="  ".repeat(o.level-1);a+=`${d}${c+1}. [${o.title}](#${fe(o.title)})
`}),a+=`
---

`),t.sections.forEach(o=>{a+=G(o)});const i=new Blob([a],{type:"text/markdown;charset=utf-8"}),n=`${w(e.title)}.md`;return{success:!0,blob:i,filename:n}}function G(e){let t="";const r="#".repeat(Math.min(e.level+1,6));return t+=`${r} ${e.title}

`,e.blocks.forEach(a=>{t+=he(a)}),e.children.forEach(a=>{t+=G(a)}),t}function he(e){var t;switch(e.type){case"paragraph":return`${e.content}

`;case"heading":return`${"#".repeat(Math.min(e.level+1,6))} ${e.content}

`;case"list":return e.items.map((l,s)=>`${e.listType==="numbered"?`${s+1}.`:"-"} ${l.content}`).join(`
`)+`

`;case"table":let a="| "+e.headers.map(l=>l.label).join(" | ")+` |
`;return a+="| "+e.headers.map(()=>"---").join(" | ")+` |
`,e.rows.forEach(l=>{const s=e.headers.map(p=>{const h=l[p.key];return String((h==null?void 0:h.formatted)||(h==null?void 0:h.value)||"")});a+="| "+s.join(" | ")+` |
`}),a+`
`;case"callout":let o=`> ${{info:"ℹ️",warning:"⚠️",success:"✅",error:"❌",tip:"💡"}[e.variant]||"ℹ️"} **${e.title||e.variant.toUpperCase()}**
`;return o+=`> 
> ${e.content}

`,o;case"kpi_card":const c=e.change!==void 0&&e.change>=0?"+":"";return`**${e.label}:** ${e.value}${e.unit||""}${e.change!==void 0?` (${c}${e.change}%)`:""}

`;case"quote":let d=`> "${e.content}"
`;return e.author&&(d+=`> — *${e.author}*
`),d+`
`;case"divider":return`---

`;case"pagebreak":return`
---
<div style="page-break-after: always;"></div>

`;case"chart":return`*[Graphique: ${((t=e.config)==null?void 0:t.title)||"Graphique"}]*

`;case"image":return e.src?`![${e.alt||"Image"}](${e.src})
${e.caption?`*${e.caption}*
`:""}
`:`*[Image: ${e.alt||e.caption||"Image"}]*

`;default:return""}}function w(e){return e.replace(/[<>:"/\\|?*]/g,"").replace(/\s+/g,"_").substring(0,100)}function f(e){const t={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"};return e.replace(/[&<>"']/g,r=>t[r])}function fe(e){return e.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/[^a-z0-9]+/g,"-").replace(/(^-|-$)/g,"")}function Se(e,t){const r=URL.createObjectURL(e),a=document.createElement("a");a.href=r,a.download=t,document.body.appendChild(a),a.click(),document.body.removeChild(a),URL.revokeObjectURL(r)}function ge(e){const t={id:e.id,centreId:e.centreId,title:e.titre,description:e.description,type:e.typeRapportCode,status:xe(e.statut),author:e.auteur,periodStart:e.periodeDebut,periodEnd:e.periodeFin,periodLabel:e.periodeLabel,contentTree:{sections:[]},version:e.versionActuelle,createdAt:e.dateCreation,updatedAt:e.dateModification,publishedAt:e.datePublication},r={sections:e.sections.map((a,i)=>me(a))};return{report:t,content:r}}function xe(e){return{brouillon:"draft",en_generation:"generating",en_revision:"review",approuve:"approved",publie:"published",archive:"archived"}[e]||"draft"}function me(e,t){return{id:e.id,type:"section",title:e.titre,level:1,blocks:e.blocs.map(ve),children:[],status:"manual",isLocked:!1,isCollapsed:e.repliee}}function ve(e){var t,r,a,i,n,o,c,d;switch(e.type){case"paragraphe":return{id:e.id,type:"paragraph",content:e.contenu||""};case"titre":return{id:e.id,type:"heading",level:e.niveau||2,content:e.contenu||""};case"tableau":return{id:e.id,type:"table",headers:((t=e.colonnes)==null?void 0:t.map((s,p)=>({id:`h-${p}`,label:s.titre,key:s.cle,sortable:s.triable,align:s.alignement,format:s.format})))||[],rows:((r=e.donnees)==null?void 0:r.map(s=>{var h;const p={};return(h=e.colonnes)==null||h.forEach(u=>{p[u.cle]={value:s[u.cle]}}),p}))||[],config:{striped:!0,bordered:!0,pagination:e.pagination,pageSize:e.lignesParPage}};case"graphique":return{id:e.id,type:"chart",chartType:$e(e.typeGraphique),data:{labels:((a=e.donnees)==null?void 0:a.labels)||[],datasets:((n=(i=e.donnees)==null?void 0:i.datasets)==null?void 0:n.map(s=>({label:s.label,data:s.data,backgroundColor:s.couleur})))||[]},config:{title:e.titre,subtitle:e.sousTitre,source:e.source,legend:{show:((o=e.legende)==null?void 0:o.afficher)||!1,position:((c=e.legende)==null?void 0:c.position)||"top"}}};case"kpi_card":return{id:e.id,type:"kpi_card",label:e.label||"",value:e.valeur||0,unit:e.unite,change:e.variation,changeType:e.tendance==="hausse"?"positive":e.tendance==="baisse"?"negative":"neutral",sparkline:e.sparkline};case"kpi_grid":const l=(d=e.kpis)==null?void 0:d[0];return l?{id:e.id,type:"kpi_card",label:l.label||"",value:l.valeur||0,unit:l.unite,change:l.variation,changeType:l.tendance==="hausse"?"positive":l.tendance==="baisse"?"negative":"neutral"}:{id:e.id,type:"paragraph",content:"[KPI Grid]"};case"image":return{id:e.id,type:"image",src:e.url||"",alt:e.alt,caption:e.legende};case"separateur":return{id:e.id,type:"divider",style:e.style||"solid"};case"saut_page":return{id:e.id,type:"pagebreak"};case"sommaire":return{id:e.id,type:"paragraph",content:"[Table des matières]"};default:return{id:e.id||`block-${Date.now()}`,type:"paragraph",content:""}}}function $e(e){return{ligne:"line",barres:"bar",barres_horizontales:"horizontal_bar",barres_empilees:"stacked_bar",camembert:"pie",donut:"donut",aire:"area"}[e]||"bar"}async function Fe(e,t,r){const{report:a,content:i}=ge(e);return X(a,i,t,r)}export{ge as convertRapportToStudioReport,Se as downloadBlob,Fe as exportRapport,X as exportReport};
