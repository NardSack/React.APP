import{I as S,g as s,k,R as w,x as y,Q as N,z as b,Z as C}from"./index-e73ac8ea.js";var O=function(i,n){return new Promise(function(m,r){if(typeof XMLHttpRequest<"u"){var d=S.of(i),a=d.dispatcher,R=d.logger,p=n.requestId,E=n.method,H=n.url,u=n.headers,f=u===void 0?{}:u,l=n.data,I=l===void 0?"":l,c=n.uploadProgressHandler,g=!1,e=new XMLHttpRequest;for(var h in e.open(E,H),f)e.setRequestHeader(h,f[h]);c&&e.upload.addEventListener("progress",function(t){t.lengthComputable?c(p,t.loaded,t.total):R.debug("Progress computing failed: `Content-Length` header is not given.")}),e.onabort=function(){r(s.requestCanceled)},e.onerror=function(t){r(s.networkError)},e.onreadystatechange=function(){if(e.readyState===XMLHttpRequest.DONE&&!g)if(e.status===0||e.status>=200&&e.status<400)try{var t=JSON.parse(e.responseText);m(new k(i,t))}catch{r(s.networkError)}else try{var q=JSON.parse(e.responseText);if(q){var o=new s(q);if(o.isSessionExpiredError){if(a.dispatch(new w({reason:o.code})),!(e instanceof y)){var v=new N;return a.dispatch(new b({request:e,deferred:v,error:o})),v.promise}}else o.isSessionInvalidatedError&&a.dispatch(new w({reason:o.code}));r(o)}else r(s.requestFailed)}catch{r(s.requestFailed)}},a.on(function(t){t instanceof C&&(t.requestId&&t.requestId!==p||(g=!0,e.abort()))}),e.send(I)}else r(s.xmlHttpRequestNotSupported)})};export{O as xmlHttpRequest};
