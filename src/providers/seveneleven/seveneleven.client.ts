import { Injectable } from '@nestjs/common'; import axios from 'axios'; import { ConfigService } from '@nestjs/config';
@Injectable() export class SevenElevenClient {private timeout:number;constructor(c:ConfigService){this.timeout=Number(c.get('REQUEST_TIMEOUT',5000))}
 private post(path:string,body:any){return axios.post(`https://new.7-elevenapp.co.kr${path}`,body,{timeout:this.timeout,headers:{'Content-Type':'application/json',Accept:'application/json','User-Agent':'Mozilla/5.0'}}).then(r=>r.data)}
 products(keyword:string){return this.post('/api/v1/open/search/goods',{collection:'goods',query:keyword,sort:'quantity/desc,itemOnm/asc',startCount:0,listCount:100})}
 stores(keyword:string){const query=keyword.trim().replace(/\s+/g,'').replace(/(역|지점|점)$/g,'');return this.post('/api/v1/open/search/store',{collection:'store',query,sort:'Date/desc',listCount:100})}
}
