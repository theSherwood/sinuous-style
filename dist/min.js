var sinuousStyle=function(){"use strict";const e=3,t=4,n=7;function u(u,s){return function(e,t){return e.push({type:8}),e.reduce((e,u)=>{if(u.type===n)e.currentSection.push(function(e,t){let n=0;for(;!"#.:[".includes(e[n])&&n!==e.length;)n++;return e.slice(0,n)+"."+t+e.slice(n)}(u.token,t));else if(6===u.type)e.sections.push(e.currentSection.join("")),e.sections.push(u.token),e.currentSection=[];else{if(8===u.type)return e.sections.push(e.currentSection.join("")),e.sections;e.currentSection.push(u.token)}return e},{currentSection:[],sections:[]})}(function(u){u=u.flatMap(e=>"string"==typeof e?e.split(""):e);let s,r,c=[],o=0,i=[];function l(){c.push({token:i.join(""),type:s}),s=void 0,i=[]}for(let h=0;h<u.length;h++)r=u[h],"function"==typeof r?(i.length&&l(),c.push({token:r,type:6})):o?(i.length||(s=1),i.push(r),"{"===r?o++:"}"===r&&(o--,o||l())):"{"===r?(i.length&&l(),o++,s=1,i.push(r)):","===r?(i.length&&s!==e&&l(),s=2,i.push(r),l()):">+~".includes(r)&&s!==n?i.length&&s!==e?(l(),c.push({token:r,type:5})):i.push(r):" \n\t\r".includes(r)?(i.length&&![t,e].includes(s)&&l(),s=t,i.push(r)):"@"===r?(i.length&&l(),s=e,i.push(r)):i.length?([n,e].includes(s)||(l(),s=n),i.push(r)):(s=n,i.push(r));return i.length&&l(),c}(u),s)}return function(e,t,n,s){let r,c=new Set([]);const o=(e,t)=>(...n)=>t(...e(...n));let i=e.h;function l(...e){let t=e[1]?e[1]:{},n=t.class||"",u=r;return t.class="function"==typeof n?()=>n()+" "+u:n+" "+u,e[1]=t,e}function h(e){return(...t)=>{if(""===t[0][0]&&"string"==typeof t[1]){let n=r;r=t[1],t[1]="";let u=e(...t);return r=n,u}return e(...t)}}function p(e){return(...t)=>{let n=r;r="";let u=e(...t);return r=n,u}}return e.h=o((function(...e){if("style"===e[0]&&e[1]&&(e[1].scoped||e[1].global)){let t=e[1].scoped,n=e[1].class,o=(t?r+"-scoped":r+"-global")+(n?"-"+n:"");if(c.has(o)||document.getElementById(o))return[];c.add(o),e[1].id=o;let l=t?u(e.slice(2),r):e.slice(2),h=s(()=>i(e[0],e[1],...l));return document.querySelector("body").append(h),[]}return l(...e)}),e.h),e.hs=o(l,e.hs),{shtml:h(t),ssvg:h(n),html:p(t),svg:p(n)}}}();