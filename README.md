# convenience-stock

NestJS 기반 편의점 상품·매장 통합 검색 PoC입니다. 외부 공개 요청을 사용하며, 계정 인증·CAPTCHA·접근제어 우회는 구현하지 않습니다.

## 지원 범위

| 브랜드 | 상품 | 매장 | 재고 |
|---|---|---|---|
| EMART24 | 구현 | 구현 | 구현 |
| SEVEN_ELEVEN | 구현 | 구현 | 미구현 |
| GS25 | 구현 | 구현 | 미구현 |
| CU | 구현 | 구현 | 미구현 |

미구현 기능은 `501 NOT_IMPLEMENTED`를 반환합니다. 재고 요청과 수량 매핑을 독립적으로 확인하지 못한 브랜드는 추정 구현하지 않았습니다. upstream 장애는 `502 UPSTREAM_API_ERROR`로 격리합니다.

## 구조

`src/common` 공통 모델/오류, `src/providers` 브랜드별 HTTP client·mapper·provider, `src/product`, `src/store`, `src/inventory` API 및 DB 저장, `src/monitor` 재고 polling 구조입니다. Provider Registry가 브랜드 adapter를 선택합니다.

## 설치 및 실행

```bash
Copy-Item .env.example .env
docker compose up -d
npm install
npm run start:dev
```

개발 환경은 TypeORM schema sync를 사용합니다. 운영 환경은 migration을 도입한 뒤 실행해야 합니다. MariaDB 및 요청 제한 시간은 `.env`에서 설정합니다.

## API

```http
GET /api/products/:brand?keyword=두바이
GET /api/stores/:brand?keyword=강남
GET /api/stores/:brand?keyword=강남&lat=37.5&lng=127.0
GET /api/inventory/:brand?productCode=12345&storeCodes=11111,22222
GET /api/search?keyword=두바이&brand=ALL
GET /api/monitor/targets
POST /api/monitor/targets   {"brand":"EMART24","productCode":"12345","storeCode":"11111"}
PATCH /api/monitor/targets/:id   {"enabled":false}
```

Brand는 고유 코드로 초기화되고, Product·Store는 Brand FK와 복합 고유 키로 저장됩니다. Inventory는 Brand/Product/Store FK, 수량, checkedAt을 저장합니다. 모니터링 대상은 브랜드 코드와 상품·매장 코드로 등록하며 `POLL_INTERVAL_MS` 간격으로 활성 대상을 조회해 이전 수량과 비교합니다. 알림 provider interface만 정의했습니다.

## API 조사

다음은 공개 저장소 [hmmhmmhm/daiso-mcp](https://github.com/hmmhmmhm/daiso-mcp)의 공개 구현을 조사한 결과입니다(2026-10-07 기준). 외부 API는 바뀔 수 있습니다.

### EMART24

| 기능 | 요청 및 필드 |
|---|---|
| 상품 | `POST https://everse.emart24.co.kr/stock/stock/search`; form-urlencoded `currentPage`, `pageCnt`, `sortType`, `saleProductYn`, `searchWord`; 응답 `productList[].pluCd`, `goodsNm`, `viewPrice` |
| 매장 | `GET https://emart24.co.kr/api1/store?page=1&search=...`; 응답 `data[].CODE`(매장 BIZNO), `TITLE`, `ADDRESS`, `PHONE`, `LATITUDE`, `LONGITUDE` |
| 재고 | `GET https://everse.emart24.co.kr/api/stock/v2/stock-search/store?searchPluCode=...&bizNoArr=...`; 응답 `storeGoodsQty[].BIZNO`, `BIZQTY` |

### SEVEN_ELEVEN

공개 구현은 `https://new.7-elevenapp.co.kr`의 `/api/v1/open/search/goods`, `/api/v1/open/search/store`에 JSON POST합니다. 요청은 `collection`, `query`, `sort`, `listCount`를 포함하며 상품은 `startCount`도 사용합니다. 상품 응답 collection 문서 필드는 `itemCd`/`prdNo`, `itemOnm`, `onlinePrice`; 매장 문서는 `storeCode` 계열, `storeName` 계열 및 주소·좌표를 포함합니다. `/api/v1/open/product/search/stock`, `/api/v1/open/stock/search/stores`, `/api/v1/open/real-stock/multi` 경로도 공개 코드에 있지만, 매장별 수량 연결은 이 PoC에서 확인하지 않아 미구현입니다.

### GS25

상품 검색은 `POST https://b2c-apigw.woodongs.com/search/v3/totalSearch` JSON `{ "query": "..." }`; 응답 `SearchQueryResult.Collection[].Documentset.Document[].field.itemCode`, `itemName`을 사용합니다. 매장 검색은 `GET https://www.gsretail.com/api/homepage/brand/storeSearch/selectGs25Stores?shopName=...`; 응답 배열 필드 `shopCode`, `shopName`, `address`, `posX`, `posY`를 사용합니다. 공개 구현의 재고 endpoint는 `https://b2c-bff.woodongs.com/api/bff/v2/store/stock`이며 좌표/상품/서비스 조건을 조합합니다. 단순 매장 코드 기반 수량 매핑은 확인하지 않아 미구현입니다.

### CU

상품 검색은 `POST https://www.pocketcu.co.kr/api/search/rest/stock/main` JSON `searchWord`, `prevSearchWord`, `spellModifyUseYn`, `offset`, `limit`, `searchSort`; 결과 `data.stockResult.result.rows[].fields`의 `item_cd`, `item_nm`, `hyun_maega`를 사용합니다. 점포명 검색은 `GET https://cu.bgfretail.com/store/list_Ajax.do`에 `searchWord`와 페이지/필터 query를 보냅니다. 응답 HTML의 매장명·전화·주소·코드 후보를 매핑합니다. PocketCU `/api/store`는 좌표 중심입니다. 상품별 매장 수량 필드를 확정하지 못해 재고 조회는 미구현입니다.

## 테스트 및 제한

HTTP 요청을 모의한 단위 테스트는 6개 스위트, 9개 테스트가 통과했습니다. Nest 빌드도 통과했습니다. 2026-10-07 실제 상품 검색 POST를 각 브랜드에 한 번씩 호출한 결과 EMART24·SEVEN_ELEVEN·GS25는 HTTP 200, CU는 HTTP 403(빈 응답)이었습니다. CU 요청을 우회하지 않았으며 현재 네트워크에서 CU 상품 검색의 실동작은 확인되지 않았습니다. 재고 API 전체 통합 테스트와 MariaDB 연결 실행은 수행하지 않았습니다. 운영 polling에는 공급사 호출 정책에 맞춘 추가 호출 제한, migration, 모니터링이 필요합니다.

참고 구현 파일: [EMART24](https://github.com/hmmhmmhm/daiso-mcp/blob/main/src/services/emart24/client.ts), [SEVEN_ELEVEN](https://github.com/hmmhmmhm/daiso-mcp/blob/main/src/services/seveneleven/client.ts), [GS25](https://github.com/hmmhmmhm/daiso-mcp/blob/main/src/services/gs25/productSearch.ts), [CU](https://github.com/hmmhmmhm/daiso-mcp/blob/main/src/services/cu/client.ts).
