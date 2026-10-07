import { Injectable } from "@nestjs/common";
import axios from "axios";
import { ConfigService } from "@nestjs/config";
@Injectable()
export class CuClient {
  private timeout: number;
  constructor(c: ConfigService) {
    this.timeout = Number(c.get("REQUEST_TIMEOUT", 5000));
  }
  products(keyword: string) {
    return axios
      .post(
        "https://www.pocketcu.co.kr/api/search/rest/stock/main",
        {
          searchWord: keyword,
          prevSearchWord: "",
          spellModifyUseYn: "Y",
          offset: 0,
          limit: 50,
          searchSort: "recom",
        },
        {
          timeout: this.timeout,
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            "X-Requested-With": "XMLHttpRequest",
            "User-Agent": "Mozilla/5.0",
          },
        },
      )
      .then((r) => r.data);
  }
  async stores(keyword: string) {
    const params = new URLSearchParams({
      pageIndex: "1",
      listType: "",
      jumpoCode: "",
      jumpoLotto: "",
      jumpoToto: "",
      jumpoCash: "",
      jumpoHour: "",
      jumpoCafe: "",
      jumpoDelivery: "",
      jumpoBakery: "",
      jumpoFry: "",
      jumpoMultiDevice: "",
      jumpoPosCash: "",
      jumpoBattery: "",
      jumpoAdderss: "",
      jumpoSido: "",
      jumpoGugun: "",
      jumpodong: "",
      searchWord: keyword,
    });
    return (
      await axios.get(`https://cu.bgfretail.com/store/list_Ajax.do?${params}`, {
        timeout: this.timeout,
        headers: {
          "User-Agent": "Mozilla/5.0",
          "X-Requested-With": "XMLHttpRequest",
          Accept: "text/html, */*; q=0.01",
        },
      })
    ).data as string;
  }
}
