var sinuousStyle=function(e,t,n){"use strict";const l=3,u=4,s=7;function r(e,t){return function(e,t){return e.push({type:8}),e.reduce((e,n)=>{if(n.type===s)e.currentSection.push(function(e,t){let n=0;for(;!"#.:[".includes(e[n])&&n!==e.length;)n++;return e.slice(0,n)+"."+t+e.slice(n)}(n.token,t));else if(6===n.type)e.sections.push(e.currentSection.join("")),e.sections.push(n.token),e.currentSection=[];else{if(8===n.type)return e.sections.push(e.currentSection.join("")),e.sections;e.currentSection.push(n.token)}return e},{currentSection:[],sections:[]})}(function(e){e=e.flatMap(e=>"string"==typeof e?e.split(""):e);let t,n,r=[],o=0,c=[];function i(){r.push({token:c.join(""),type:t}),t=void 0,c=[]}for(let h=0;h<e.length;h++)n=e[h],"function"==typeof n?(c.length&&i(),r.push({token:n,type:6})):o?(c.length||(t=1),c.push(n),"{"===n?o++:"}"===n&&(o--,o||i())):"{"===n?(c.length&&i(),o++,t=1,c.push(n)):","===n?(c.length&&t!==l&&i(),t=2,c.push(n),i()):">+~".includes(n)&&t!==s?c.length&&t!==l?(i(),r.push({token:n,type:5})):c.push(n):" \n\t\r".includes(n)?(c.length&&![u,l].includes(t)&&i(),t=u,c.push(n)):"@"===n?(c.length&&i(),t=l,c.push(n)):c.length?([s,l].includes(t)||(i(),t=s),c.push(n)):(t=s,c.push(n));return c.length&&i(),r}(e),t)}let o,c={},i=new Set([]);const h=(e,t)=>(...n)=>t(...e(...n));let p=t.api.h;t.api.h=h((function(...e){if("style"===e[0]&&e[1]&&(e[1].local||e[1].global)){let t=e[1],l=t.local,u=t.class;t.class=o+" "+(t.class||"");let s=(l?o+"-local":o+"-global")+(u?"-"+u:"");if(i.has(s)||f.querySelector("#"+s))return[];i.add(s),t.id=s;let c=l?r(e.slice(2),o):e.slice(2);return function(e){f.append(e)}(n.root(()=>p(e[0],t,...c))),[]}return a(...e)}),t.api.h),t.api.hs=h(a,t.api.hs);let f=document.querySelector("head");function a(...e){let t=e[1]?e[1]:{},n=t.class||"",l=o;return t.class="function"==typeof n?()=>n()+" "+l:n+" "+l,e[1]=t,e}function d(e){return(...t)=>{if(Array.isArray(t[0])){let n=o;o="";let l=e(...t);return o=n,l}return(...l)=>{let u=o;o=t.length?t[0]:o;let s=o;c[s]?c[s]++:c[s]=1,n.cleanup(()=>{--c[s]<1&&(delete c[s],function(e){for(let t of f.querySelectorAll("."+e))"STYLE"===t.nodeName&&(i.delete(t.id),t.remove())}(s))});let r=e(...l);return o=u,r}}}const g=d(t.html),y=d(t.svg);return e.html=g,e.svg=y,e}({},S,S);